import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { ReviewResultSchema, type ReviewResult } from "./schema";

export async function reviewDocument(
  document: string,
  focus?: string
): Promise<ReviewResult> {
  if (!document || document.trim().length < 10) {
    return { comments: [] };
  }

  const focusNote = focus ? `Focus on: ${focus}` : "";

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      output: Output.object({ schema: ReviewResultSchema }),
      system: `You are Notebook554, a strict, actionable writing editor. Return ONLY valid JSON.

RULES:
1. quote = exact text copied from the document. Can be a few words, a full sentence, or a whole paragraph.
2. message = EXTREMELY CONCISE reason (max 4 words).
3. suggestion = THE FIX. You MUST provide a concrete replacement.
4. category = ONE WORD describing the type of issue.`,
      prompt: `${focusNote}

DOCUMENT:
"""
${document}
"""

Return JSON with comments array. Every comment must have a suggestion and category.`,
    });

    if (!result.output?.comments) {
      return { comments: [] };
    }

    // Filter out comments where quote doesn't exist in document
    const valid = result.output.comments.filter(
      (c) => c.quote && document.includes(c.quote)
    );

    return { comments: valid };
  } catch (error) {
    console.error("[reviewer] Error:", error);
    return { comments: [] };
  }
}
