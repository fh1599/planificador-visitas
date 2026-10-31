import { z } from "zod";
import { getDatabase } from "@/db/connection";
import { visitService } from "@/server/visits";
import { assertMutationRequest, respond } from "@/server/http";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => {
    assertMutationRequest(request);
    z.strictObject({ status: z.literal("Cancelada") }).parse(await request.json());
    const { id } = await context.params;
    z.string().regex(/^\d+$/).parse(id);
    return { visit: await visitService(getDatabase()).cancel(Number(id)) };
  });
}
