import type { z } from "zod";
import type { suggestionInputSchema } from "./input";
import type { AvailabilityBlock } from "./availability";
import { checkPlanning, type PlannedVisit } from "./planning";
import { WORKDAY_END, WORKDAY_START } from "./time";

export type SlotQuery = z.output<typeof suggestionInputSchema>;
export type Slot = { technicianId: number; technicianName: string; siteId: number; date: string; startMinute: number; duration: number };

export function suggestSlots(query: SlotQuery, team: { id: number; name: string }[], visits: PlannedVisit[], blocks: AvailabilityBlock[]): Slot[] {
  const candidates: Slot[] = [];
  for (const technician of team.filter((t) => !query.technicianId || query.technicianId === t.id)) {
    let windowStart: number | null = null;
    const end = WORKDAY_END - query.duration;
    const addWindow = (lastStart: number) => {
      if (windowStart === null) return;
      candidates.push({ technicianId: technician.id, technicianName: technician.name, siteId: query.siteId, date: query.date, duration: query.duration, startMinute: Math.max(windowStart, Math.min(query.startMinute, lastStart)) });
      windowStart = null;
    };
    // Integer-minute scan: at most 540 × four technicians. Collapse consecutive
    // valid starts into one useful option instead of near-duplicate minutes.
    for (let startMinute = WORKDAY_START; startMinute <= end; startMinute++) {
      const valid = !checkPlanning({ ...query, technicianId: technician.id, startMinute, status: "Programada" }, visits, blocks);
      if (valid && windowStart === null) windowStart = startMinute;
      if (!valid) addWindow(startMinute - 1);
    }
    addWindow(end);
  }
  return candidates.sort((a, b) => Math.abs(a.startMinute - query.startMinute) - Math.abs(b.startMinute - query.startMinute) || a.startMinute - b.startMinute || a.technicianId - b.technicianId).slice(0, 3);
}
