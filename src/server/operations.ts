import { asc, eq } from "drizzle-orm";
import type { Database } from "../db/connection";
import { annotations, sites, technicians, visitEvents, visits, visitTypes } from "../db/schema";
import { idSchema } from "../domain/input";
import { annotationSchema, siteProfileSchema, visitTypeSchema } from "../domain/operations";
import { VisitError } from "./visits";

export function operationsService(db: Database) {
  return {
    async updateSite(rawId: unknown, input: unknown) {
      const id = idSchema.parse(rawId);
      const data = siteProfileSchema.parse(input);
      const [site] = await db.update(sites).set(data).where(eq(sites.id, id)).returning();
      if (!site) throw new VisitError("SITE_NOT_FOUND", "La obra no existe.", 404);
      return site;
    },
    async createType(input: unknown) {
      const [type] = await db.insert(visitTypes).values(visitTypeSchema.parse(input)).returning();
      return type;
    },
    async updateType(rawId: unknown, input: unknown) {
      const id = idSchema.parse(rawId);
      const data = visitTypeSchema.parse(input);
      const [type] = await db.update(visitTypes).set(data).where(eq(visitTypes.id, id)).returning();
      if (!type) throw new VisitError("TYPE_NOT_FOUND", "El tipo de visita no existe.", 404);
      return type;
    },
    async detail(rawId: unknown) {
      const id = idSchema.parse(rawId);
      const [row] = await db.select({ visit: visits, site: sites, technician: technicians }).from(visits)
        .innerJoin(sites, eq(visits.siteId, sites.id)).innerJoin(technicians, eq(visits.technicianId, technicians.id)).where(eq(visits.id, id));
      if (!row) throw new VisitError("VISIT_NOT_FOUND", "La visita no existe.", 404);
      const entries = await db.select().from(annotations).where(eq(annotations.visitId, id)).orderBy(asc(annotations.createdAt), asc(annotations.id));
      const events = await db.select().from(visitEvents).where(eq(visitEvents.visitId, id)).orderBy(asc(visitEvents.id));
      return { ...row, annotations: entries.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })), history: events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })) };
    },
    async annotate(rawId: unknown, input: unknown) {
      const id = idSchema.parse(rawId);
      const data = annotationSchema.parse(input);
      const [visit] = await db.select({ id: visits.id }).from(visits).where(eq(visits.id, id));
      if (!visit) throw new VisitError("VISIT_NOT_FOUND", "La visita no existe.", 404);
      const [entry] = await db.insert(annotations).values({ ...data, visitId: id }).returning();
      return { ...entry, createdAt: entry.createdAt.toISOString() };
    },
  };
}

export type VisitDetail = Awaited<ReturnType<ReturnType<typeof operationsService>["detail"]>>;
