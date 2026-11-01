import { and, asc, eq, gte, lte } from "drizzle-orm";
import type { Database } from "../db/connection";
import { availabilityBlocks, blockEvents, technicians, visits } from "../db/schema";
import { blockInputSchema } from "../domain/availability";
import { filterSchema, idSchema } from "../domain/input";
import { checkPlanning } from "../domain/planning";
import { displayDate, formatMinute } from "../domain/time";
import { VisitError } from "./visits";

export function availabilityService(db: Database) {
  return {
    async list(input: unknown = {}) {
      const filters = filterSchema.parse(input);
      return db.select({ id: availabilityBlocks.id, technicianId: availabilityBlocks.technicianId, technicianName: technicians.name, startDate: availabilityBlocks.startDate, endDate: availabilityBlocks.endDate, startMinute: availabilityBlocks.startMinute, endMinute: availabilityBlocks.endMinute, reason: availabilityBlocks.reason, active: availabilityBlocks.active })
        .from(availabilityBlocks).innerJoin(technicians, eq(availabilityBlocks.technicianId, technicians.id))
        .where(and(eq(availabilityBlocks.active, true), filters.technicianId ? eq(availabilityBlocks.technicianId, filters.technicianId) : undefined, filters.date ? lte(availabilityBlocks.startDate, filters.date) : undefined, filters.date ? gte(availabilityBlocks.endDate, filters.date) : undefined))
        .orderBy(asc(availabilityBlocks.startDate), asc(availabilityBlocks.startMinute), asc(availabilityBlocks.id));
    },
    async create(input: unknown) {
      const data = blockInputSchema.parse(input);
      return db.transaction(async (tx) => {
        const [technician] = await tx.select().from(technicians).where(eq(technicians.id, data.technicianId)).for("update");
        if (!technician) throw new VisitError("TECHNICIAN_NOT_FOUND", "El técnico no existe.", 404);
        const blocks = await tx.select().from(availabilityBlocks).where(and(eq(availabilityBlocks.technicianId, data.technicianId), eq(availabilityBlocks.active, true), lte(availabilityBlocks.startDate, data.endDate), gte(availabilityBlocks.endDate, data.startDate)));
        if (blocks.some((b) => b.startMinute < data.endMinute && data.startMinute < b.endMinute)) throw new VisitError("BLOCK_OVERLAP", "Ya hay un bloqueo que coincide con estas fechas y horas. Revisa los bloqueos existentes.");
        const planned = await tx.select().from(visits).where(and(eq(visits.technicianId, data.technicianId), eq(visits.status, "Programada"), gte(visits.date, data.startDate), lte(visits.date, data.endDate)));
        const allBlocks = [...blocks, { ...data, active: true }];
        const affected = planned.filter((v) => checkPlanning(v, planned.filter((other) => other.id !== v.id), allBlocks));
        if (affected.length) {
          const summary = affected.slice(0, 5).map((v) => `#${v.id} (${displayDate(v.date)}, ${formatMinute(v.startMinute)})`).join(", ");
          throw new VisitError("BLOCK_CONFLICT", `El bloqueo afecta a ${affected.length} visita(s) o a su desplazamiento: ${summary}${affected.length > 5 ? "…" : ""}. Reprograma o cancela esas visitas antes de bloquear.`, 409, { visitIds: affected.map((v) => v.id) });
        }
        const [saved] = await tx.insert(availabilityBlocks).values(data).returning();
        await tx.insert(blockEvents).values({ blockId: saved.id, kind: "Bloqueada" });
        return saved;
      }, { isolationLevel: "read committed" });
    },
    async remove(rawId: unknown) {
      const id = idSchema.parse(rawId);
      return db.transaction(async (tx) => {
        const [block] = await tx.select().from(availabilityBlocks).where(eq(availabilityBlocks.id, id));
        if (!block) throw new VisitError("BLOCK_NOT_FOUND", "El bloqueo no existe.", 404);
        await tx.select().from(technicians).where(eq(technicians.id, block.technicianId)).for("update");
        const [current] = await tx.select().from(availabilityBlocks).where(eq(availabilityBlocks.id, id));
        if (!current.active) return current;
        const [saved] = await tx.update(availabilityBlocks).set({ active: false }).where(eq(availabilityBlocks.id, id)).returning();
        await tx.insert(blockEvents).values({ blockId: saved.id, kind: "Liberada" });
        return saved;
      }, { isolationLevel: "read committed" });
    },
  };
}
export type BlockRow = Awaited<ReturnType<ReturnType<typeof availabilityService>["list"]>>[number];
