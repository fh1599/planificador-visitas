import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export function createDatabase(url: string) {
  const client = postgres(url, { max: 5, prepare: false, connect_timeout: 15, idle_timeout: 20 });
  return { client, db: drizzle(client, { schema }) };
}

export type Database = ReturnType<typeof createDatabase>["db"];
const globalDatabase = globalThis as unknown as { visitsDatabase?: ReturnType<typeof createDatabase> };

export function getDatabase() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  globalDatabase.visitsDatabase ??= createDatabase(process.env.DATABASE_URL);
  return globalDatabase.visitsDatabase.db;
}
