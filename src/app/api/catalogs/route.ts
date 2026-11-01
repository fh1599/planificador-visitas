import { getDatabase } from "@/db/connection";
import { visitService } from "@/server/visits";
import { respond } from "@/server/http";

export const runtime = "nodejs";
export async function GET() {
  return respond(() => visitService(getDatabase()).catalogs());
}
