import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { z } from "zod";

const CommentSchema = z.object({
  original_text: z.string().describe("The EXACT text from the document. Copy it precisely—this is how we highlight it."),
  comment: z.string().describe("One sentence explaining the issue. Be direct."),
  suggestion: z.string().nullable().describe("REQUIRED for 'insert'/'rewrite': the exact replacement or addition text. Only null for 'praise'."),
  kind: z.enum(["insert", "rewrite", "praise"]).describe("'insert' = add text, 'rewrite' = replace text, 'praise' = compliment (no suggestion needed)"),
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
    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      output: Output.object({
        schema: z.object({
          comments: z.array(CommentSchema),
        }),
      }),
      system: `You are a precise writing editor. Generate inline comments.
${focus ? `Focus: ${focus.toUpperCase()}` : ""}

RULES:
1. 'original_text' must be EXACT text from the document.
2. 'comment' must be ONE concise sentence explaining the issue.
3. 'suggestion' is REQUIRED for 'insert' and 'rewrite'—provide the exact text to add or replace. Only 'praise' can have null suggestion.
4. Be specific. No vague advice. Every rewrite/insert must have concrete replacement text.

ACTIONS:
- insert: Add missing content. 'suggestion' = text to add. 'original_text' = text before insertion point.
- rewrite: Fix or improve text. 'suggestion' = replacement text. 'original_text' = text to replace.
- praise: Compliment strong writing. 'suggestion' = null.`,
      prompt: `Document:
"""
${document}
"""

Generate specific comments. Every 'insert' or 'rewrite' MUST include a concrete 'suggestion' with the exact text to use.`,
    });

    console.log("[reviewer] ====== RECEIVED FROM LLM ======");
    console.log("[reviewer] Generated comments:", output.comments.length);
    console.log("[reviewer] Comments:");
    output.comments.forEach((c: any, i: number) => {
      console.log(`[reviewer] Comment ${i + 1}:`, JSON.stringify(c, null, 2));
    });
    console.log("[reviewer] ==================================");
    return output.comments;
  } catch (error) {
    console.error("[reviewer] Error generating comments:", error);
    throw error;
  }
}
