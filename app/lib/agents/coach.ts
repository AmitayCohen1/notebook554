import { ToolLoopAgent } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { generateComments } from "./reviewer";

/**
 * Factory function that creates a WritingCoachAgent per request.
 * This pattern is necessary because tools need access to request-specific data (the document).
 * See: https://ai-sdk.dev/docs/agents/building-agents
 */
export function createWritingCoachAgent(document: string, pendingComments?: string[]) {
  let contextInfo = "";
  if (pendingComments && pendingComments.length > 0) {
    contextInfo = `\n\nCURRENT PENDING SUGGESTIONS:\n${pendingComments.join("\n")}`;
  }

  return new ToolLoopAgent({
    model: anthropic("claude-sonnet-4-20250514"),

    instructions: `You are a professional writing coach and editor.

CURRENT DOCUMENT:
"""
${document}
"""
${contextInfo}

RESPONSE MODES:
1. **TOOL MODE**: When the user wants "review", "feedback", or "analysis" of their document, use the 'review_document' tool. This generates structured, highlightable comments.
2. **TEXT MODE**: For casual conversation, answering questions, or discussing writing concepts.

When using tools, keep your text response brief (e.g., "I've added suggestions to the sidebar.").`,

    tools: {
      review_document: {
        description: "Analyze the document and generate inline comments with specific suggestions. Use this for document reviews and feedback requests.",
        inputSchema: z.object({
          focus: z.string().optional().describe("Optional focus area: 'grammar', 'clarity', 'tone', 'structure', etc."),
        }),
        execute: async ({ focus }: { focus?: string }) => {
          // Document is captured via closure - this is the AI SDK 6 pattern
          const comments = await generateComments(document, focus);
          return { comments };
        },
      },
    },
  });
}
