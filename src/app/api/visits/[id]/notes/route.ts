import { getDatabase } from "@/db/connection";
import { operationsService } from "@/server/operations";
import { assertMutationRequest, respond, routeId } from "@/server/http";

export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => {
    assertMutationRequest(request);
    return { annotation: await operationsService(getDatabase()).annotate(await routeId(context), await request.json()) };
  }, 201);
}
