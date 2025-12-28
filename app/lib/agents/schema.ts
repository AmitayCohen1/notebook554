import { z } from "zod";

// Simple quote-based comments
export const CommentSchema = z.object({
  quote: z.string().min(1).describe("Exact text from the document to highlight."),
  message: z.string().describe("One sentence explaining the issue."),
  suggestion: z.string().describe("The replacement text."),
  category: z.string().describe("A single word describing the type of issue (e.g., Clarity, Flow, Tone)."),
});

export type Comment = z.infer<typeof CommentSchema>;

export const ReviewResultSchema = z.object({
  comments: z.array(CommentSchema),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>;

export const ChatResultSchema = z.object({
  text: z.string().describe("Direct answer in 1-3 short sentences."),
});

export type ChatResult = z.infer<typeof ChatResultSchema>;
