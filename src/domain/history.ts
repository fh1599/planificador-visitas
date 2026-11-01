export type VisitSnapshot = {
  technicianId: number; siteId: number; date: string; startMinute: number;
  duration: number; status: "Programada" | "Cancelada"; version: number;
};
export function visitSnapshot(visit: VisitSnapshot): VisitSnapshot {
  const { technicianId, siteId, date, startMinute, duration, status, version } = visit;
  return { technicianId, siteId, date, startMinute, duration, status, version };
}
