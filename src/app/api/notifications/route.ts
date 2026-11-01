import { getDatabase } from "@/db/connection";
import { notificationFeed } from "@/server/notifications";
import { respond } from "@/server/http";
export const runtime = "nodejs";
export async function GET() { return respond(() => notificationFeed(getDatabase())); }
