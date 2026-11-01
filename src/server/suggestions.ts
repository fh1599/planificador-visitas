import { and, asc, eq, gte, lte } from "drizzle-orm";
import type { Database } from "../db/connection";
import { availabilityBlocks, sites, technicians, visits } from "../db/schema";
import { suggestionInputSchema } from "../domain/input";
import { suggestSlots } from "../domain/suggestions";
import { VisitError } from "./visits";

export async function findSuggestions(db: Database, input: unknown) {
  const query = suggestionInputSchema.parse(input);
  return db.transaction(async (tx) => {
    const [site] = await tx.select({ id: sites.id }).from(sites).where(eq(sites.id, query.siteId));
    if (!site) throw new VisitError("SITE_NOT_FOUND", "Selecciona una obra existente para buscar horarios.", 404);
    const team = await tx.select().from(technicians).where(query.technicianId ? eq(technicians.id, query.technicianId) : undefined).orderBy(asc(technicians.id));
    if (query.technicianId && !team.length) throw new VisitError("TECHNICIAN_NOT_FOUND", "El técnico no existe.", 404);
    const planned = await tx.select().from(visits).where(and(eq(visits.date, query.date), eq(visits.status, "Programada")));
    const blocks = await tx.select().from(availabilityBlocks).where(and(eq(availabilityBlocks.active, true), lte(availabilityBlocks.startDate, query.date), gte(availabilityBlocks.endDate, query.date)));
    return suggestSlots(query, team, planned, blocks);
  }, { isolationLevel: "repeatable read", accessMode: "read only" });
}
