import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { z } from "zod";
import { generateComments } from "@/app/lib/agents/reviewer";

export async function POST(req: Request) {
  const { messages, document, context } = await req.json();
  
  console.log("[API] Received request with", messages.length, "messages");
  console.log("[API] Context:", context);

  // Build context string for memory
  let contextInfo = "";
  if (context) {
    if (context.appliedEdits?.length > 0) {
      contextInfo += `\n\nPREVIOUS EDITS THE USER ACCEPTED:\n${context.appliedEdits.join("\n")}`;
    }
    if (context.dismissedFeedback?.length > 0) {
      contextInfo += `\n\nFEEDBACK THE USER DISMISSED (don't repeat these):\n${context.dismissedFeedback.join("\n")}`;
    }
    if (context.pendingComments?.length > 0) {
      contextInfo += `\n\nCURRENT PENDING SUGGESTIONS:\n${context.pendingComments.join("\n")}`;
    }
  }

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `You are a helpful writing coach. The user has written a document and wants feedback.

DOCUMENT:
"""
${document}
"""
${contextInfo}

You have TWO options for responding:

1. **Reply with text** - If the user asks a question, wants clarification, or just wants to chat about their writing, respond naturally in text.

2. **Use the review_document tool** - If the user asks you to "analyze", "review", "give feedback", or "check" their document, use this tool to generate inline comments.

When you use the review tool, just say something brief like "I've reviewed your document" - the UI will show the detailed comments.

IMPORTANT: Don't repeat feedback the user already dismissed. Build on edits they accepted.`,
      messages,
      tools: {
        review_document: {
          description: "Analyze the document and generate inline comments with suggestions. Use this when the user wants a review or feedback.",
          inputSchema: z.object({
            focus: z.string().optional().describe("Optional focus area like 'grammar', 'clarity', 'tone'"),
          }),
          execute: async ({ focus }: { focus?: string }) => {
            console.log("[API] Tool called with focus:", focus);
            const comments = await generateComments(document, focus);
            console.log("[API] Generated", comments.length, "comments");
            return { comments };
          },
        },
      },
    });

    console.log("[API] Result text:", result.text);
    console.log("[API] Tool results:", JSON.stringify(result.toolResults, null, 2));
    console.log("[API] Tool calls:", JSON.stringify(result.toolCalls, null, 2));

    // Extract comments from tool results
    let comments: any[] = [];
    if (result.toolResults && result.toolResults.length > 0) {
      console.log("[API] Found", result.toolResults.length, "tool results");
      for (const toolResult of result.toolResults) {
        const res = toolResult as any;
        console.log("[API] Tool result keys:", Object.keys(res));
        console.log("[API] Tool result:", JSON.stringify(res, null, 2));
        // Comments might be in output.comments or result.comments depending on the SDK version
        if (res.output?.comments) {
          comments = res.output.comments;
          console.log("[API] Found comments in res.output:", comments.length);
        } else if (res.result?.comments) {
          comments = res.result.comments;
          console.log("[API] Found comments in res.result:", comments.length);
        } else if (res.comments) {
          comments = res.comments;
          console.log("[API] Found comments directly in res:", comments.length);
        }
      }
    } else {
      console.log("[API] No tool results found");
    }

    return Response.json({
      text: result.text || "I've reviewed your document and added some suggestions.",
      comments,
    });
  } catch (error) {
    console.error("[API] Error:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
