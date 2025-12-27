import { createWritingCoachAgent } from "@/app/lib/agents/coach";

export async function POST(req: Request) {
  const { messages, document, context } = await req.json();
  
  console.log("[API] Received request with", messages.length, "messages");

  try {
    // Create agent per-request with document in closure (AI SDK 6 pattern)
    const agent = createWritingCoachAgent(document, context?.pendingComments);
    
    const result = await agent.generate({ messages });

    console.log("[API] Result text:", result.text);
    console.log("[API] Steps:", result.steps?.length || 0);

    // Extract comments from tool results across all steps
    let comments: any[] = [];
    if (result.steps) {
      for (const step of result.steps) {
        if (step.toolResults) {
          for (const toolResult of step.toolResults) {
            const tr = toolResult as any;
            if (tr.toolName === "review_document" && tr.output?.comments) {
              comments = tr.output.comments;
              console.log("[API] Found", comments.length, "comments from tool");
            }
          }
        }
      }
    }

    return Response.json({
      text: result.text || "I've reviewed your document.",
      comments,
    });
  } catch (error) {
    console.error("[API] Error:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
