import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output, streamText } from "ai";
import { z } from "zod";

const OverallAssessmentSchema = z.object({
  summary: z
    .string()
    .describe(
      "A conversational, natural paragraph (2-3 sentences) giving overall impressions. Write as if chatting with the author directly (use 'I', 'you'). Don't be formal."
    ),
  strengths: z
    .array(z.string())
    .optional()
    .describe("DEPRECATED - leave empty"),
  priorities: z
    .array(z.string())
    .optional()
    .describe("DEPRECATED - leave empty"),
});

const CommentSchema = z.object({
  start_phrase: z
    .string()
    .describe(
      "The first 5-10 words of the text section you're commenting on. Copy exactly as it appears."
    ),
  end_phrase: z
    .string()
    .describe(
      "The last 5-10 words of the text section you're commenting on. Copy exactly as it appears."
    ),
  kind: z
    .enum(["rewrite", "insert", "delete", "clarify", "question", "praise"])
    .describe(
      "rewrite: replace text, insert: add something, delete: remove something, clarify: explain what's wrong, question: ask author for intent, praise: reinforce something good"
    ),
  category: z
    .enum([
      "thesis",
      "structure",
      "clarity",
      "logic",
      "transitions",
      "examples",
      "tone",
      "style",
    ])
    .describe("Which dimension of writing this feedback addresses"),
  impact: z
    .enum(["low", "medium", "high"])
    .describe(
      "high: significantly affects reader understanding, medium: noticeable improvement, low: minor polish"
    ),
  feedback: z
    .string()
    .describe(
      "ONE sentence max. What's wrong and why it matters."
    ),
  suggested_edit: z
    .string()
    .nullable()
    .describe(
      "The complete replacement text for this section. Null if kind is 'delete', 'clarify', or 'question'"
    ),
});

const AnalysisSchema = z.object({
  overall: OverallAssessmentSchema.optional(),
  comments: z.array(CommentSchema),
});

export async function POST(request: Request) {
  try {
    const { document, customInstructions, mode } = await request.json();

    if (!document || typeof document !== "string") {
      return Response.json(
        { error: "Document is required" },
        { status: 400 }
      );
    }

    console.log("--- DEBUG ANALYSIS INPUT ---", { mode });

    // Mode: "overall" = just summary, "chunk" = detailed comments
    const isOverallMode = mode === "overall";

    if (isOverallMode) {
      const result = await streamText({
        model: anthropic("claude-sonnet-4-5"),
        prompt: `You are a friendly, expert writing coach.
        
Document:
${document}

${customInstructions ? `FOCUS: ${customInstructions}\n\n` : ""}

Write a short, encouraging but honest chat message to the author about their draft. Start with something like 'Hey, I read through your draft...' or 'This is a solid start...'. Focus on the big picture. 2-3 sentences max. Be conversational. Do NOT output JSON. Just plain text.`,
      });

      return result.toTextStreamResponse();
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      output: Output.object({
        schema: AnalysisSchema,
      }),
      prompt: `You are an expert editor. Be concise and direct.

Document:
${document}

${
  customInstructions
    ? `FOCUS: ${customInstructions}\n\n`
    : ""
}

## Output Format (for this chunk):

{
  "comments": [
    {
      "start_phrase": "First 5-10 words EXACTLY",
      "end_phrase": "Last 5-10 words EXACTLY",
      "kind": "rewrite | insert | delete | clarify | question | praise",
      "category": "thesis | structure | clarity | logic | transitions | examples | tone | style",
      "impact": "high | medium | low",
      "feedback": "ONE sentence. What's wrong + why matters.",
      "suggested_edit": "replacement or null"
    }
  ]
}

Provide 3-8 comments for this text chunk.

## Rules:

BREVITY:
- feedback field: ONE sentence only
- strengths/priorities: 5-8 words each
- summary: 3-4 sentences max

MATCHING:
- Copy start/end phrases EXACTLY (punctuation, caps)
- Match short sections (1 sentence) or paragraphs

QUALITY:
- Bad: "This is long" → Good: "47-word sentence buries the point"
- Bad: "Needs transition" → Good: "Abrupt topic shift disorients readers"
- Use impact=high only for critical issues (2-3 total)
- Include 1-2 praise comments

Be brutal. Be brief. Be useful.`,
    });

    console.log("Result:", JSON.stringify(result, null, 2));
    
    // When using output: Output.object, the result.object contains the typed data
    // Note: TypeScript might not infer this property correctly if not using 'experimental_object' 
    // but 'generateText' with 'output: Output.object' puts the result in .object
    const finalData = (result as any).object || (result.text && typeof result.text === 'object' ? result.text : null);
    
    if (!finalData) {
       console.error("No object returned from generateText");
       // Fallback to parsing text if needed, though Output.object usually handles this
       try {
          return Response.json(JSON.parse(result.text));
       } catch (e) {
          return Response.json({ comments: [] });
       }
    }

    return Response.json(finalData);
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
