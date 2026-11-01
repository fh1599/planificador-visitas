import { and, asc, eq, inArray, ne } from "drizzle-orm";
import type { Database } from "../db/connection";
import { availabilityBlocks, sites, technicians, visitEvents, visits, visitTypes } from "../db/schema";
import { filterSchema, idSchema, rescheduleInputSchema, visitInputSchema } from "../domain/input";
import { checkPlanning } from "../domain/planning";
import { visitSnapshot } from "../domain/history";

export class VisitError extends Error {
  constructor(public code: string, message: string, public httpStatus = 409, public details?: Record<string, unknown>) { super(message); }
}

export function visitService(db: Database) {
  return {
    async create(input: unknown) {
      const data = visitInputSchema.parse(input);
      return db.transaction(async (tx) => {
        // The parent row exists even when the agenda is empty. Every write for
        // this technician takes this lock BEFORE reading current availability.
        const [technician] = await tx.select().from(technicians).where(eq(technicians.id, data.technicianId)).for("update");
        if (!technician) throw new VisitError("TECHNICIAN_NOT_FOUND", "El técnico seleccionado no existe.", 404);
        const [site] = await tx.select().from(sites).where(eq(sites.id, data.siteId));
        if (!site) throw new VisitError("SITE_NOT_FOUND", "La obra seleccionada no existe.", 404);
        const [type] = data.typeId ? await tx.select().from(visitTypes).where(eq(visitTypes.id, data.typeId)).for("share") : [];
        if (data.typeId && (!type || !type.active)) throw new VisitError("TYPE_UNAVAILABLE", "Este tipo ya no está disponible. Recarga los tipos o programa la visita sin tipo.");
        const existing = await tx.select().from(visits).where(and(eq(visits.technicianId, data.technicianId), eq(visits.date, data.date), eq(visits.status, "Programada")));
        const blocks = await tx.select().from(availabilityBlocks).where(and(eq(availabilityBlocks.technicianId, data.technicianId), eq(availabilityBlocks.active, true)));
        const conflict = checkPlanning({ ...data, status: "Programada" }, existing, blocks);
        if (conflict) throw new VisitError(conflict.code, conflict.message);
        const [saved] = await tx.insert(visits).values({ ...data, typeName: type?.name, typeInstructions: type?.instructions }).returning();
        await tx.insert(visitEvents).values({ visitId: saved.id, kind: "Programada", after: visitSnapshot(saved) });
        return saved;
      }, { isolationLevel: "read committed" });
    },
    async reschedule(rawId: unknown, input: unknown) {
      const id = idSchema.parse(rawId);
      const { version, ...data } = rescheduleInputSchema.parse(input);
      return db.transaction(async (tx) => {
        // Every edit/cancellation locks the visit first, then technicians in ID
        // order. Creation/blocks lock technicians only and never wait on visits.
        const [original] = await tx.select().from(visits).where(eq(visits.id, id)).for("update");
        if (!original) throw new VisitError("VISIT_NOT_FOUND", "La visita no existe.", 404);
        if (original.status === "Cancelada") throw new VisitError("VISIT_CANCELLED", "La visita ya está cancelada. Actualiza el detalle para consultar su estado.");
        if (original.version !== version) throw new VisitError("STALE_VISIT", "La visita ha cambiado desde que la abriste. Actualiza el detalle y revisa los nuevos datos antes de guardar.");
        const team = await tx.select().from(technicians).where(inArray(technicians.id, [...new Set([original.technicianId, data.technicianId])])).orderBy(asc(technicians.id)).for("update");
        if (!team.some((t) => t.id === data.technicianId)) throw new VisitError("TECHNICIAN_NOT_FOUND", "El técnico seleccionado no existe.", 404);
        const [site] = await tx.select().from(sites).where(eq(sites.id, data.siteId));
        if (!site) throw new VisitError("SITE_NOT_FOUND", "La obra seleccionada no existe.", 404);
        const existing = await tx.select().from(visits).where(and(eq(visits.technicianId, data.technicianId), eq(visits.date, data.date), eq(visits.status, "Programada"), ne(visits.id, id)));
        const blocks = await tx.select().from(availabilityBlocks).where(and(eq(availabilityBlocks.technicianId, data.technicianId), eq(availabilityBlocks.active, true)));
        const conflict = checkPlanning({ ...data, status: "Programada" }, existing, blocks);
        if (conflict) throw new VisitError(conflict.code, conflict.message);
        if (original.technicianId === data.technicianId && original.siteId === data.siteId && original.date === data.date && original.startMinute === data.startMinute && original.duration === data.duration) return original;
        const [saved] = await tx.update(visits).set({ ...data, version: version + 1 }).where(eq(visits.id, id)).returning();
        await tx.insert(visitEvents).values({ visitId: id, kind: "Reprogramada", before: visitSnapshot(original), after: visitSnapshot(saved) });
        return saved;
      }, { isolationLevel: "read committed" });
    },
    async cancel(rawId: unknown, expectedVersion?: unknown) {
      const id = idSchema.parse(rawId);
      const version = expectedVersion === undefined ? undefined : idSchema.parse(expectedVersion);
      return db.transaction(async (tx) => {
        const [visit] = await tx.select().from(visits).where(eq(visits.id, id)).for("update");
        if (!visit) throw new VisitError("VISIT_NOT_FOUND", "La visita no existe.", 404);
        if (visit.status === "Cancelada") return visit;
        if (version !== undefined && visit.version !== version) throw new VisitError("STALE_VISIT", "La visita ha cambiado. Actualiza la agenda y revisa el horario antes de cancelarla.");
        await tx.select().from(technicians).where(eq(technicians.id, visit.technicianId)).for("update");
        const [updated] = await tx.update(visits).set({ status: "Cancelada", version: visit.version + 1 }).where(eq(visits.id, id)).returning();
        await tx.insert(visitEvents).values({ visitId: id, kind: "Cancelada", before: visitSnapshot(visit), after: visitSnapshot(updated) });
        return updated;
      }, { isolationLevel: "read committed" });
    },
    async list(input: unknown = {}) {
      const filters = filterSchema.parse(input);
      return db.select({
        id: visits.id, date: visits.date, startMinute: visits.startMinute, duration: visits.duration,
        status: visits.status, technicianId: visits.technicianId, technicianName: technicians.name,
        siteId: visits.siteId, siteName: sites.name, municipality: sites.municipality,
        typeId: visits.typeId, typeName: visits.typeName,
        version: visits.version,
      }).from(visits).innerJoin(technicians, eq(visits.technicianId, technicians.id)).innerJoin(sites, eq(visits.siteId, sites.id))
        .where(and(filters.technicianId ? eq(visits.technicianId, filters.technicianId) : undefined, filters.date ? eq(visits.date, filters.date) : undefined))
        .orderBy(asc(visits.date), asc(visits.startMinute), asc(visits.id));
    },
    async catalogs() {
      const [team, locations, types] = await Promise.all([
        db.select().from(technicians).orderBy(asc(technicians.name)),
        db.select().from(sites).orderBy(asc(sites.name)),
        db.select().from(visitTypes).orderBy(asc(visitTypes.name), asc(visitTypes.id)),
      ]);
      return { technicians: team, sites: locations, types };
    },
  };
}

export type VisitRow = Awaited<ReturnType<ReturnType<typeof visitService>["list"]>>[number];
export type Catalogs = Awaited<ReturnType<ReturnType<typeof visitService>["catalogs"]>>;
