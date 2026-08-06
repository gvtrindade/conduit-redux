import { getActiveSquad } from "@/actions/members";
import { auth } from "@/lib/auth";
import { subscribeSquad, type SquadRealtimeEvent } from "@/lib/realtime";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const activeSquad = await getActiveSquad(session.user.id);
  const squadId = activeSquad?.activeSquad?.id;
  if (!squadId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
const send = (event: SquadRealtimeEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // client already disconnected
        }
      };

      unsubscribe = subscribeSquad(squadId, send);
      send({ type: "connected" });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":ping\n\n"));
        } catch {
          // client already disconnected
        }
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}