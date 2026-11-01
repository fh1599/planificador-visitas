import { blocksForDay, travelStart, type AvailabilityBlock } from "./availability";
import type { PlannedVisit } from "./planning";

type CalendarVisit = PlannedVisit & { id: number; siteName: string };
type CalendarBlock = AvailabilityBlock & { id: number; reason: string };
export type DayEntry = { id: string; kind: "visit" | "block" | "travel"; startMinute: number; endMinute: number; label: string; visitId?: number };

export function timelinePosition(startMinute: number, endMinute: number) {
  return { top: (startMinute - 480) / 540 * 100, height: (endMinute - startMinute) / 540 * 100 };
}
export function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + days);
  const result = value.toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : date;
}
export function dayEntries(date: string, technicianId: number, visits: CalendarVisit[], blocks: CalendarBlock[]): DayEntry[] {
  const planned = visits.filter((v) => v.date === date && v.technicianId === technicianId && v.status === "Programada").toSorted((a, b) => a.startMinute - b.startMinute);
  const unavailable = blocksForDay(blocks, technicianId, date) as CalendarBlock[];
  const entries: DayEntry[] = [
    ...planned.map((v) => ({ id: `visit-${v.id}`, kind: "visit" as const, visitId: v.id, startMinute: v.startMinute, endMinute: v.startMinute + v.duration, label: v.siteName })),
    ...unavailable.map((b) => ({ id: `block-${b.id}`, kind: "block" as const, startMinute: b.startMinute, endMinute: b.endMinute, label: b.reason || "Indisponibilidad" })),
  ];
  for (let i = 1; i < planned.length; i++) {
    const previous = planned[i - 1], next = planned[i];
    if (previous.siteId === next.siteId) continue;
    const start = travelStart(previous.startMinute + previous.duration, next.startMinute, unavailable);
    if (start !== null) entries.push({ id: `travel-${previous.id}-${next.id}`, kind: "travel", startMinute: start, endMinute: start + 30, label: "Desplazamiento" });
  }
  return entries.sort((a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id));
}
