import { getDatabase } from "@/db/connection";
import { findSuggestions } from "@/server/suggestions";
import { assertMutationRequest, respond } from "@/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return respond(async () => {
    assertMutationRequest(request);
    return { suggestions: await findSuggestions(getDatabase(), await request.json()) };
  });
}
