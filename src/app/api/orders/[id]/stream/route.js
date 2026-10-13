import { getOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";
import {
  RESTAURANT_LOCATION,
  areaLocation,
  distanceMeters,
  interpolatePoint,
  seedFromString,
} from "@/lib/geo";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
const TICK_MS = 1200;
const COURIER_SPEED_METERS_PER_SECOND = 45;

function sse(event, data, id) {
  const lines = [`event: ${event}`, `data: ${JSON.stringify(data)}`];
  if (id !== undefined) lines.unshift(`id: ${id}`);
  return encoder.encode(`${lines.join("\n")}\n\n`);
}

function waitUntil(milliseconds, isAborted) {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      if (isAborted() || Date.now() - start >= milliseconds) resolve();
      else setTimeout(check, 40);
    };
    check();
  });
}

export async function GET(request, { params }) {
  const user = await getSession();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const order = await getOrder(id);
  if (!order || (order.userId !== user.id && user.role !== "staff")) {
    return new Response("Not found", { status: 404 });
  }

  const delivery = areaLocation(order.area);
  let aborted = false;

  const stream = new ReadableStream({
    async start(controller) {
      if (order.status === "cancelled") {
        controller.enqueue(
          sse("status", { status: "cancelled", at: new Date().toISOString() }, 0),
        );
        controller.enqueue(sse("done", { reason: "cancelled" }, 1));
        controller.close();
        return;
      }

      controller.enqueue(
        sse(
          "snapshot",
          {
            orderId: order.id,
            status: order.status,
            restaurant: RESTAURANT_LOCATION,
            delivery,
            courier: RESTAURANT_LOCATION,
          },
          0,
        ),
      );

      const jitterSeed = seedFromString(order.id) * 0.002;
      const rideSeconds = Math.max(
        18,
        Math.round(distanceMeters(RESTAURANT_LOCATION, delivery) / COURIER_SPEED_METERS_PER_SECOND),
      );
      const totalSteps = Math.max(8, Math.ceil(rideSeconds / (TICK_MS / 1000)));

      let previousStatus = order.status;
      let step = 0;

      while (!aborted) {
        await waitUntil(TICK_MS, () => aborted);
        if (aborted) break;

        step += 1;
        const latest = await getOrder(order.id);
        const status = latest?.status ?? previousStatus;
        const progress = Math.min(step / totalSteps, 1);

        controller.enqueue(
          sse(
            "position",
            {
              courier: interpolatePoint(
                RESTAURANT_LOCATION,
                delivery,
                progress,
                jitterSeed,
              ),
              progress,
            },
            step,
          ),
        );

        if (status !== previousStatus) {
          previousStatus = status;
          controller.enqueue(
            sse("status", { status, at: new Date().toISOString() }, step),
          );
        }

        if (status === "cancelled" || status === "delivered" || progress >= 1) {
          controller.enqueue(
            sse(
              "done",
              {
                reason:
                  status === "cancelled"
                    ? "cancelled"
                    : status === "delivered"
                      ? "delivered"
                      : "arrived",
              },
              step,
            ),
          );
          try {
            controller.close();
          } catch {
            // Already closed by the platform after a disconnect.
          }
          break;
        }
      }
    },
    cancel() {
      aborted = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}