import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { Database } from "../db/connection";
import { availabilityBlocks, blockEvents, sites, technicians, visitEvents, visits } from "../db/schema";
import { upcomingReminders, type Notification } from "../domain/notifications";
import { displayDate, formatMinute, localDate } from "../domain/time";

export async function notificationFeed(db: Database, now = new Date()) {
  return db.transaction(async (tx) => {
    const since = new Date(now.getTime() - 7 * 86400000);
    const planned = await tx.select({ id: visits.id, date: visits.date, startMinute: visits.startMinute, status: visits.status, version: visits.version, technicianName: technicians.name, siteName: sites.name }).from(visits)
      .innerJoin(technicians, eq(visits.technicianId, technicians.id)).innerJoin(sites, eq(visits.siteId, sites.id))
      .where(and(eq(visits.status, "Programada"), eq(visits.date, localDate(now))));
    const events = await tx.select().from(visitEvents).where(and(gte(visitEvents.createdAt, since), lte(visitEvents.createdAt, now))).orderBy(desc(visitEvents.createdAt), desc(visitEvents.id)).limit(50);
    const blockActivity = await tx.select({ event: blockEvents, block: availabilityBlocks, technicianName: technicians.name }).from(blockEvents)
      .innerJoin(availabilityBlocks, eq(blockEvents.blockId, availabilityBlocks.id)).innerJoin(technicians, eq(availabilityBlocks.technicianId, technicians.id))
      .where(and(gte(blockEvents.createdAt, since), lte(blockEvents.createdAt, now))).orderBy(desc(blockEvents.createdAt), desc(blockEvents.id)).limit(50);
    const team = await tx.select().from(technicians); const locations = await tx.select().from(sites);
    const activity: Notification[] = [
      ...events.map((e) => ({ key: `event:${e.id}`, kind: "activity" as const, title: `Visita ${e.kind.toLowerCase()} · #${e.visitId}`, text: `${team.find((t) => t.id === e.after.technicianId)?.name} · ${locations.find((s) => s.id === e.after.siteId)?.name} · ${displayDate(e.after.date)}, ${formatMinute(e.after.startMinute)}–${formatMinute(e.after.startMinute + e.after.duration)}`, visitId: e.visitId, createdAt: e.createdAt.toISOString() })),
      ...blockActivity.map(({ event, block, technicianName }) => ({ key: `block-event:${event.id}`, kind: "activity" as const, title: `Disponibilidad ${event.kind.toLowerCase()}`, text: `${technicianName} · ${displayDate(block.startDate)}${block.startDate !== block.endDate ? `–${displayDate(block.endDate)}` : ""} · ${formatMinute(block.startMinute)}–${formatMinute(block.endMinute)}${block.reason ? ` · ${block.reason}` : ""}`, blockId: block.id, createdAt: event.createdAt.toISOString() })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.key.localeCompare(a.key)).slice(0, 50);
    return { reminders: upcomingReminders(planned, now), activity, serverTime: now.toISOString() };
  }, { isolationLevel: "repeatable read", accessMode: "read only" });
}
export type NotificationFeed = Awaited<ReturnType<typeof notificationFeed>>;
