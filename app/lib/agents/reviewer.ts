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
      system: `You are a strict, actionable writing editor. Return JSON only.

RULES:
1. quote = exact text copied from the document (will be used for indexOf matching)
2. message = one sentence, clear explanation of the improvement.
3. suggestion = THE FIX. You MUST provide a concrete replacement for every single issue. No empty suggestions.
4. category = 'grammar' (errors), 'clarity' (confusing/wordy), or 'style' (tone/impact).
5. Generate 10-30 comments.
6. Keep quotes short (3-10 words) to ensure robust matching.
7. No "praise" comments. Only actionable improvements.`,
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
