import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

const CommentSchema = z.object({
  original_text: z.string().describe("The EXACT text from the document you're commenting on. Copy it precisely - this is how we'll find and highlight it."),
  comment: z.string().describe("Brief, actionable description of the issue or feedback (1-2 sentences)"),
  suggestion: z.string().nullable().describe("For 'rewrite', provide the replacement text. For 'insert', provide the text to add. For 'praise', leave null."),
  kind: z.enum(["insert", "rewrite", "praise"]).describe("The type of feedback: 'insert' to add new content, 'rewrite' to change existing text, 'praise' for positive feedback"),
  category: z.enum(["thesis", "structure", "clarity", "logic", "transitions", "examples", "tone", "style", "consistency", "grammar"]),
  impact: z.enum(["low", "medium", "high"]),
});

export async function generateComments(document: string, focus?: string) {
  console.log("[reviewer] Starting generateComments");
  console.log("[reviewer] Document length:", document?.length);
  
  if (!document || document.length < 10) {
    console.log("[reviewer] Document too short, returning empty comments");
    return [];
  }

  console.log("[reviewer] ====== SENDING TO LLM ======");
  console.log("[reviewer] Document:");
  console.log(document);
  console.log("[reviewer] ============================");

  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: z.object({
        comments: z.array(CommentSchema),
      }),
      system: `You are an expert writing coach. Generate inline comments for the document.
${focus ? `Focus on: ${focus.toUpperCase()}` : ""}

CRITICAL RULES:
1. For 'original_text': Copy the EXACT text from the document you're commenting on. This must match PRECISELY - it's how we find and highlight it.
2. For 'suggestion': Provide the COMPLETE replacement text (for rewrites) or new text to add (for inserts).
3. Keep 'original_text' focused - usually 1-3 sentences. Don't copy huge chunks.
4. Be concise and actionable.

YOU MUST ONLY USE THESE 3 ACTIONS:
- insert: elaborate, add data, or add missing content (original_text = text BEFORE where you want to insert)
- rewrite: rephrase, clarify, or fix existing text (original_text = text to replace)
- praise: compliment good writing (suggestion can be null)`,
      prompt: `Document:
"""
${document}
"""

Generate 3-5 specific, actionable comments using only 'insert', 'rewrite', or 'praise'. For each comment, include the EXACT text you're referring to in 'original_text'.`,
    });

    console.log("[reviewer] ====== RECEIVED FROM LLM ======");
    console.log("[reviewer] Generated comments:", result.object.comments.length);
    console.log("[reviewer] Comments:");
    result.object.comments.forEach((c, i) => {
      console.log(`[reviewer] Comment ${i + 1}:`, JSON.stringify(c, null, 2));
    });
    console.log("[reviewer] ==================================");
    return result.object.comments;
  } catch (error) {
    console.error("[reviewer] Error generating comments:", error);
    throw error;
  }
}
