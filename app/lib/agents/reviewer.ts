import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

const CommentSchema = z.object({
  start_phrase: z.string().describe("Copy EXACTLY 5-15 words from the document that start the section you're commenting on"),
  end_phrase: z.string().describe("Copy EXACTLY - same as start_phrase, or the last few words if commenting on a longer section"),
  kind: z.enum(["insert", "rewrite", "praise"]).describe("The type of feedback: 'insert' to add new content, 'rewrite' to change existing text, 'praise' for positive feedback"),
  category: z.enum(["thesis", "structure", "clarity", "logic", "transitions", "examples", "tone", "style", "consistency", "grammar"]),
  impact: z.enum(["low", "medium", "high"]),
  feedback: z.string().describe("Brief, actionable feedback (1-2 sentences)"),
  suggested_edit: z.string().nullable().describe("For 'rewrite', provide the replacement text. For 'insert', provide the text to add. For 'praise', leave null."),
});

export async function generateComments(document: string, focus?: string) {
  console.log("[reviewer] Starting generateComments");
  console.log("[reviewer] Document length:", document?.length);
  console.log("[reviewer] Document preview:", document?.substring(0, 100));
  
  if (!document || document.length < 10) {
    console.log("[reviewer] Document too short, returning empty comments");
    return [];
  }
  
  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: z.object({
        comments: z.array(CommentSchema),
      }),
      system: `You are an expert writing coach. Generate inline comments for the document.
${focus ? `Focus on: ${focus.toUpperCase()}` : ""}

CRITICAL RULES:
1. The start_phrase MUST be copied EXACTLY from the document - same capitalization, punctuation, spacing
2. The start_phrase should be 5-15 words that uniquely identify the text you're commenting on
3. For suggested_edit, provide the COMPLETE replacement text (not just changes)
4. Be concise and actionable

YOU MUST ONLY USE THESE 3 ACTIONS:
- insert: elaborate, add data, or add missing content. 'suggested_edit' should be the content to add.
- rewrite: rephrase, clarify, or fix existing text. 'suggested_edit' should be the improved version.
- praise: compliment good writing. 'suggested_edit' should be null.`,
      prompt: `Document:
"""
${document}
"""

Generate 3-5 specific, actionable comments using only 'insert', 'rewrite', or 'praise'. For each comment, copy the start_phrase EXACTLY from the document above.`,
    });

    console.log("[reviewer] Generated comments:", result.object.comments.length);
    return result.object.comments;
  } catch (error) {
    console.error("[reviewer] Error generating comments:", error);
    throw error;
  }
}
