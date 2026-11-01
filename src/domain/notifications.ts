import { formatMinute, localDate } from "./time";

export type Notification = { key: string; kind: "reminder" | "activity"; title: string; text: string; visitId?: number; blockId?: number; createdAt: string };
type ReminderVisit = { id: number; date: string; startMinute: number; status: "Programada" | "Cancelada"; version: number; technicianName: string; siteName: string };

export function upcomingReminders(visits: ReminderVisit[], now: Date): Notification[] {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const part = (name: string) => Number(parts.find((p) => p.type === name)?.value);
  const seconds = part("hour") * 3600 + part("minute") * 60 + part("second") + now.getUTCMilliseconds() / 1000;
  const date = localDate(now);
  return visits.filter((v) => v.status === "Programada" && v.date === date && v.startMinute * 60 >= seconds && v.startMinute * 60 - seconds <= 1800)
    .toSorted((a, b) => a.startMinute - b.startMinute || a.id - b.id)
    .map((v) => ({ key: `reminder:${v.id}:${v.version}`, kind: "reminder", title: `Próxima visita · ${formatMinute(v.startMinute)}`, text: `${v.technicianName} · ${v.siteName}`, visitId: v.id, createdAt: now.toISOString() }));
}
export function parseReadKeys(value: string | null): string[] {
  try { const parsed: unknown = JSON.parse(value ?? "[]"); return Array.isArray(parsed) ? [...new Set(parsed.filter((v): v is string => typeof v === "string" && v.length < 100))].slice(-1000) : []; }
  catch { return []; }
}
export function markReadKeys(current: string[], added: string[]): string[] {
  return [...new Set([...current, ...added])].slice(-1000);
}
