import { answerQuestion } from "@/app/lib/agents/coach";
import { reviewDocument } from "@/app/lib/agents/reviewer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, document, context, mode, focus } = body as {
      messages: any[];
      document: string;
      context?: { pendingComments?: string[] };
      mode?: "review" | "chat";
      focus?: string;
    };

    // Default behavior: if caller didn't specify, infer from prompt-ish single message
    const resolvedMode: "review" | "chat" =
      mode ??
      (messages?.length === 1 &&
      typeof messages?.[0]?.content === "string" &&
      /review|analy/i.test(messages[0].content)
        ? "review"
        : "chat");

    if (resolvedMode === "review") {
      const review = await reviewDocument(document, focus);
      return Response.json({ text: "Line comments", comments: review.comments });
    }

    const text = await answerQuestion({
      document,
      messages,
      pendingComments: context?.pendingComments,
    });

    return Response.json({ text, comments: [] });
  } catch (error) {
    console.error("[API] Error:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
