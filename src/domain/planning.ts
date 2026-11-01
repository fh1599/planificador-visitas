import { formatMinute, TRAVEL_MINUTES, WORKDAY_END, WORKDAY_START } from "./time";
import { blocksForDay, travelStart, type AvailabilityBlock } from "./availability";

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
  code: "WORKING_HOURS" | "OVERLAP" | "TRAVEL_TIME" | "UNAVAILABLE";
  message: string;
};

/** Pure scheduling rules. Input types and calendar dates are validated at the server boundary. */
export function checkPlanning(candidate: PlannedVisit, visits: PlannedVisit[], blocks: AvailabilityBlock[] = []): PlanningError | null {
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
  const unavailable = blocksForDay(blocks, candidate.technicianId, candidate.date);
  const blocked = unavailable.find((b) => candidate.startMinute < b.endMinute && b.startMinute < end);
  if (blocked) return { code: "UNAVAILABLE", message: `El técnico tiene un bloqueo de disponibilidad de ${formatMinute(blocked.startMinute)} a ${formatMinute(blocked.endMinute)}.` };
  const ordered = [...active, candidate].sort((a, b) => a.startMinute - b.startMinute);
  for (let i = 1; i < ordered.length; i++) {
    const previous = ordered[i - 1]; const next = ordered[i];
    if (previous !== candidate && next !== candidate) continue;
    if (previous.siteId === next.siteId) continue;
    if (travelStart(previous.startMinute + previous.duration, next.startMinute, unavailable, TRAVEL_MINUTES) === null) {
      return { code: "TRAVEL_TIME", message: `Se necesitan al menos 30 minutos continuos disponibles de desplazamiento entre obras diferentes, entre las ${formatMinute(previous.startMinute + previous.duration)} y las ${formatMinute(next.startMinute)}. Los bloqueos no cuentan como tiempo disponible.` };
    }
  }
  return null;
}
