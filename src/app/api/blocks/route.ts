import { getDatabase } from "@/db/connection";
import { availabilityService } from "@/server/availability";
import { assertMutationRequest, respond } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return respond(async () => ({ blocks: await availabilityService(getDatabase()).list(Object.fromEntries(new URL(request.url).searchParams)) }));
}
export async function POST(request: Request) {
  return respond(async () => {
    assertMutationRequest(request);
    return { block: await availabilityService(getDatabase()).create(await request.json()) };
  }, 201);
}
