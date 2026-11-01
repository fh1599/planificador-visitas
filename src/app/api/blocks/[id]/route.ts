import { z } from "zod";
import { getDatabase } from "@/db/connection";
import { availabilityService } from "@/server/availability";
import { assertMutationRequest, respond, routeId } from "@/server/http";
export const runtime = "nodejs";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => {
    assertMutationRequest(request);
    z.strictObject({ active: z.literal(false) }).parse(await request.json());
    return { block: await availabilityService(getDatabase()).remove(await routeId(context)) };
  });
}
