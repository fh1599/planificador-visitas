import { z } from "zod";
import { getDatabase } from "@/db/connection";
import { visitService } from "@/server/visits";
import { assertMutationRequest, respond, routeId } from "@/server/http";
import { operationsService } from "@/server/operations";
import { idSchema } from "@/domain/input";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => operationsService(getDatabase()).detail(await routeId(context)));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => {
    assertMutationRequest(request);
    const { version } = z.strictObject({ status: z.literal("Cancelada"), version: idSchema.optional() }).parse(await request.json());
    const { id } = await context.params;
    z.string().regex(/^\d+$/).parse(id);
    return { visit: await visitService(getDatabase()).cancel(Number(id), version) };
  });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => {
    assertMutationRequest(request);
    return { visit: await visitService(getDatabase()).reschedule(await routeId(context), await request.json()) };
  });
}
