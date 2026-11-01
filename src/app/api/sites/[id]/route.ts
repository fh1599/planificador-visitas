import { getDatabase } from "@/db/connection";
import { operationsService } from "@/server/operations";
import { assertMutationRequest, respond, routeId } from "@/server/http";

export const runtime = "nodejs";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return respond(async () => {
    assertMutationRequest(request);
    return { site: await operationsService(getDatabase()).updateSite(await routeId(context), await request.json()) };
  });
}
