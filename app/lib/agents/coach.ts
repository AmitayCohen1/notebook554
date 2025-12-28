import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output, type ModelMessage } from "ai";
import { ChatResultSchema } from "./schema";

export async function answerQuestion(args: {
  document: string;
  messages: ModelMessage[];
  pendingComments?: string[];
}) {
  const { document, messages, pendingComments } = args;

  const pending =
    pendingComments && pendingComments.length
      ? `PENDING SUGGESTIONS (do not repeat verbatim unless asked):\n- ${pendingComments.join(
          "\n- "
        )}`
      : "PENDING SUGGESTIONS: none";

  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    output: Output.object({ schema: ChatResultSchema }),
    system: `You are WriteGuide Coach. Return ONLY valid JSON.

ROLE:
- Answer the user's question about THIS document.

HARD RULES:
- 1–3 short sentences. No fluff. No preamble. No apologies.
- If the question cannot be answered from the document, say what info is missing in one sentence.
- Do not suggest using tools. Do not generate inline comments here.
- Do not output markdown. Do not add keys other than { "text": ... }.
`,
    messages: [
      {
        role: "system",
        content: `DOCUMENT:\n\"\"\"\n${document}\n\"\"\"\n\n${pending}`,
      },
      ...messages,
    ],
  });

  return output.text;
}
