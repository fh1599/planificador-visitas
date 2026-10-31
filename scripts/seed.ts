import { config } from "dotenv";
import { createDatabase } from "../src/db/connection";
import { seedCatalogs } from "../src/db/seed";
config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("Configura DATABASE_URL en .env.local.");
const { db, client } = createDatabase(process.env.DATABASE_URL);
try {
  await seedCatalogs(db);
  console.log("Catálogos disponibles: cuatro técnicos y cuatro obras ficticias.");
} finally { await client.end(); }
