import { config } from "dotenv";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabase } from "../src/db/connection";
config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("Configura DATABASE_URL en .env.local.");
const { db, client } = createDatabase(process.env.DATABASE_URL);
try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migraciones aplicadas correctamente.");
} finally { await client.end(); }
