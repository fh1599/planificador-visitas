import { z } from "zod";
import { dateSchema, idSchema } from "./input";

const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).transform((value) => {
  const [h, m] = value.split(":").map(Number); return h * 60 + m;
});
export const blockInputSchema = z.strictObject({
  technicianId: idSchema, startDate: dateSchema, endDate: dateSchema,
  startTime: clock, endTime: clock, reason: z.string().trim().max(300),
}).refine((v) => v.startDate <= v.endDate, "La fecha final debe ser igual o posterior a la inicial.")
  .refine((v) => v.startTime >= 480 && v.endTime <= 1020 && v.startTime < v.endTime, "El bloqueo debe estar entre 08:00 y 17:00 y tener duración positiva.")
  .transform(({ startTime, endTime, ...rest }) => ({ ...rest, startMinute: startTime, endMinute: endTime }));

export type AvailabilityBlock = { technicianId: number; startDate: string; endDate: string; startMinute: number; endMinute: number; active: boolean };
export function blocksForDay(blocks: AvailabilityBlock[], technicianId: number, date: string) {
  return blocks.filter((b) => b.active && b.technicianId === technicianId && b.startDate <= date && b.endDate >= date);
}

/** First continuous free interval; overlapping unavailable intervals are merged. */
export function travelStart(start: number, end: number, blocks: AvailabilityBlock[], duration = 30): number | null {
  let cursor = start;
  for (const block of blocks.toSorted((a, b) => a.startMinute - b.startMinute)) {
    if (block.endMinute <= cursor || block.startMinute >= end) continue;
    if (Math.min(block.startMinute, end) - cursor >= duration) return cursor;
    cursor = Math.max(cursor, block.endMinute);
    if (cursor >= end) return null;
  }
  return end - cursor >= duration ? cursor : null;
}
