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
      system: `You are a writing reviewer. Return JSON only.

RULES:
1. quote = exact text copied from the document (will be used for indexOf matching)
2. message = one sentence, concrete feedback
3. suggestion = replacement text, or null if no change needed
4. Generate 10-30 comments. More is better.
5. Keep quotes short (1-2 sentences max) to avoid duplicates.
6. No markdown, no meta commentary.`,
      prompt: `${focusNote}

DOCUMENT:
"""
${document}
"""

Return JSON with comments array.`,
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
