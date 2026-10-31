import type { Database } from "./connection";
import { sites, technicians } from "./schema";

/** Repeatable sample catalogs; never deletes or updates an existing visit. */
export async function seedCatalogs(db: Database) {
  await db.transaction(async (tx) => {
    await tx.insert(technicians).values([
      { id: 1, name: "Carlos Martín" }, { id: 2, name: "Laura Soler" },
      { id: 3, name: "Marc Vidal" }, { id: 4, name: "Ana Torres" },
    ]).onConflictDoNothing();
    await tx.insert(sites).values([
      { id: 1, name: "Residencial Can Roca", municipality: "Terrassa" },
      { id: 2, name: "Centro Cívico Nord", municipality: "Sabadell" },
      { id: 3, name: "Edificio del Parc", municipality: "Sant Cugat del Vallès" },
      { id: 4, name: "Nave Industrial Can Jardí", municipality: "Rubí" },
    ]).onConflictDoNothing();
  });
}
