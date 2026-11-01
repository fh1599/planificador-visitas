import { getDatabase } from "@/db/connection";
import { operationsService } from "@/server/operations";
import { assertMutationRequest, respond } from "@/server/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return respond(async () => {
    assertMutationRequest(request);
    return { type: await operationsService(getDatabase()).createType(await request.json()) };
  }, 201);
}
