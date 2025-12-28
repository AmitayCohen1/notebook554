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
    contextInfo = `\n\nPENDING SUGGESTIONS:\n${pendingComments.join("\n")}`;
  }

  return new ToolLoopAgent({
    model: anthropic("claude-sonnet-4-20250514"),

    instructions: `You are a writing coach. Be EXTREMELY brief.

DOCUMENT:
"""
${document}
"""
${contextInfo}

RULES:
1. For reviews/feedback → use 'review_document' tool. Keep your response very short. Nothing more.
2. For questions → answer in 1-2 sentences max. No fluff.
3. Never give general writing advice. Be specific or stay silent.`,

    tools: {
      review_document: {
        description: "Analyze document and generate specific inline comments with concrete suggestions.",
        inputSchema: z.object({
          focus: z.string().optional().describe("Focus area: 'grammar', 'clarity', 'tone', 'structure'"),
        }),
        execute: async ({ focus }: { focus?: string }) => {
          const comments = await generateComments(document, focus);
          return { comments };
        },
      },
    },
  });
}
