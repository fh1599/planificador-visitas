import { getDatabase } from "@/db/connection";
import { visitService } from "@/server/visits";
import { assertMutationRequest, respond } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return respond(async () => ({ visits: await visitService(getDatabase()).list(Object.fromEntries(new URL(request.url).searchParams)) }));
}

export async function POST(request: Request) {
  return respond(async () => {
    assertMutationRequest(request);
    const input: unknown = await request.json();
    return { visit: await visitService(getDatabase()).create(input) };
  }, 201);
}
