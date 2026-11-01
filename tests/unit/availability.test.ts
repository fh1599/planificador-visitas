import { describe, expect, it } from "vitest";
import { checkPlanning, type PlannedVisit } from "../../src/domain/planning";
import { blockInputSchema } from "../../src/domain/availability";

const visit: PlannedVisit = { technicianId: 1, siteId: 1, date: "2026-11-02", startMinute: 540, duration: 60, status: "Programada" };
const block = { technicianId: 1, startDate: visit.date, endDate: visit.date, startMinute: 570, endMinute: 630, active: true };

describe("AM-04 · Bloqueos y desplazamiento disponible", () => {
  it.each([[540, 60], [580, 10], [480, 200]])("rechaza una visita %s + %s que cruza un bloqueo", (startMinute, duration) => {
    expect(checkPlanning({ ...visit, startMinute, duration }, [], [block])?.code).toBe("UNAVAILABLE");
  });
  it("permite extremos exactos y no añade un viaje propio al bloqueo", () => {
    expect(checkPlanning({ ...visit, duration: 30 }, [], [block])).toBeNull();
    expect(checkPlanning({ ...visit, startMinute: 630 }, [], [block])).toBeNull();
  });
  it("distingue técnico, fechas inclusivas y bloqueos retirados", () => {
    expect(checkPlanning(visit, [], [{ ...block, technicianId: 2 }])).toBeNull();
    expect(checkPlanning(visit, [], [{ ...block, active: false }])).toBeNull();
    expect(checkPlanning(visit, [], [{ ...block, startDate: "2026-11-03", endDate: "2026-11-04" }])).toBeNull();
    expect(checkPlanning(visit, [], [{ ...block, startDate: "2026-11-01", endDate: visit.date }])?.code).toBe("UNAVAILABLE");
  });
  it("exige 30 minutos continuos disponibles entre obras, sin sumar trozos separados", () => {
    const next = { ...visit, siteId: 2, startMinute: 660 };
    expect(checkPlanning(next, [visit], [{ ...block, startMinute: 630, endMinute: 650 }])).toBeNull();
    expect(checkPlanning(next, [visit], [{ ...block, startMinute: 629, endMinute: 650 }])?.code).toBe("TRAVEL_TIME");
    expect(checkPlanning(next, [visit], [{ ...block, startMinute: 620, endMinute: 640 }])?.code).toBe("TRAVEL_TIME");
    expect(checkPlanning({ ...next, siteId: 1 }, [visit], [{ ...block, startMinute: 620, endMinute: 640 }])).toBeNull();
  });
  it("valida rangos de fechas/horas y rechaza campos desconocidos", () => {
    const input = { technicianId: 1, startDate: visit.date, endDate: visit.date, startTime: "08:00", endTime: "17:00", reason: "" };
    expect(blockInputSchema.parse(input).endMinute).toBe(1020);
    for (const changes of [{ endDate: "2026-11-01" }, { startTime: "07:59" }, { endTime: "17:01" }, { startTime: "17:00" }, { active: false }]) {
      expect(blockInputSchema.safeParse({ ...input, ...changes }).success).toBe(false);
    }
  });
});
