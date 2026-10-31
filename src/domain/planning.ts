import { formatMinute, TRAVEL_MINUTES, WORKDAY_END, WORKDAY_START } from "./time";

export type VisitStatus = "Programada" | "Cancelada";
export type PlannedVisit = {
  technicianId: number;
  siteId: number;
  date: string;
  startMinute: number;
  duration: number;
  status: VisitStatus;
};
export type PlanningError = {
  code: "WORKING_HOURS" | "OVERLAP" | "TRAVEL_TIME";
  message: string;
};

/** Pure scheduling rules. Input types and calendar dates are validated at the server boundary. */
export function checkPlanning(candidate: PlannedVisit, visits: PlannedVisit[]): PlanningError | null {
  const end = candidate.startMinute + candidate.duration;
  if (candidate.startMinute < WORKDAY_START || end > WORKDAY_END) {
    return { code: "WORKING_HOURS", message: "La visita debe empezar y terminar entre las 08:00 y las 17:00." };
  }
  const active = visits.filter((v) => v.status === "Programada" && v.technicianId === candidate.technicianId && v.date === candidate.date)
    .toSorted((a, b) => a.startMinute - b.startMinute);
  for (const visit of active) {
    if (candidate.startMinute < visit.startMinute + visit.duration && visit.startMinute < end) {
      return { code: "OVERLAP", message: `El técnico ya tiene una visita de ${formatMinute(visit.startMinute)} a ${formatMinute(visit.startMinute + visit.duration)}. Los horarios no pueden solaparse.` };
    }
  }
  for (const visit of active) {
    if (visit.siteId === candidate.siteId) continue;
    const previous = visit.startMinute + visit.duration <= candidate.startMinute;
    const gap = previous ? candidate.startMinute - (visit.startMinute + visit.duration) : visit.startMinute - end;
    if (gap < TRAVEL_MINUTES) {
      return { code: "TRAVEL_TIME", message: `Se necesitan al menos 30 minutos de desplazamiento entre obras diferentes. Solo hay ${gap} minutos ${previous ? "desde la visita anterior" : "hasta la visita siguiente"}.` };
    }
  }
  return null;
}
