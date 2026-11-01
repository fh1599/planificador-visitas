import { describe, expect, it } from "vitest";
import { suggestSlots } from "../../src/domain/suggestions";
import { checkPlanning, type PlannedVisit } from "../../src/domain/planning";

const query = { siteId: 1, date: "2026-11-02", startMinute: 540, duration: 60 };
const team = [{ id: 1, name: "A" }, { id: 2, name: "B" }, { id: 3, name: "C" }, { id: 4, name: "D" }];
const visit: PlannedVisit = { ...query, technicianId: 1, status: "Programada" };

describe("AM-01 · Propuestas válidas y útiles", () => {
  it("devuelve hasta tres propuestas estables, una por hueco continuo y técnico", () => {
    expect(suggestSlots(query, team, [], []).map((s) => [s.technicianId, s.startMinute])).toEqual([[1, 540], [2, 540], [3, 540]]);
    expect(suggestSlots({ ...query, technicianId: 1 }, team, [], [])).toHaveLength(1);
  });
  it("localiza extremos exactos sin redondear a intervalos de 15 minutos", () => {
    const existing = [{ ...visit, startMinute: 480, duration: 61 }, { ...visit, startMinute: 542, duration: 478 }];
    expect(suggestSlots({ ...query, technicianId: 1, duration: 1 }, team, existing, []).map((s) => s.startMinute)).toEqual([541]);
    expect(suggestSlots({ ...query, technicianId: 1, duration: 540 }, team, [], [])[0].startMinute).toBe(480);
  });
  it("respeta traslado anterior y posterior, canceladas y bloqueos", () => {
    const existing = [{ ...visit, siteId: 2 }, { ...visit, startMinute: 780, siteId: 2 }, { ...visit, startMinute: 630, status: "Cancelada" as const }];
    const blocks = [{ technicianId: 1, startDate: query.date, endDate: query.date, startMinute: 660, endMinute: 720, active: true }];
    const options = suggestSlots({ ...query, technicianId: 1, duration: 30, startMinute: 630 }, team, existing, blocks);
    expect(options[0].startMinute).toBe(630);
    for (const option of options) expect(checkPlanning({ ...option, status: "Programada" }, existing, blocks)).toBeNull();
  });
  it("no inventa huecos en una agenda llena ni sin técnicos disponibles", () => {
    const existing = team.map((t) => ({ ...visit, technicianId: t.id, startMinute: 480, duration: 540 }));
    expect(suggestSlots(query, team, existing, [])).toEqual([]);
    expect(suggestSlots(query, [], [], [])).toEqual([]);
  });
  it("todas las propuestas satisfacen las reglas en combinaciones de duración y obra", () => {
    const existing = [{ ...visit, startMinute: 480, duration: 30 }, { ...visit, startMinute: 720, duration: 60, siteId: 2 }];
    for (const duration of [1, 29, 30, 31, 60, 179, 540]) for (const siteId of [1, 2]) {
      const options = suggestSlots({ ...query, duration, siteId }, team, existing, []);
      expect(new Set(options.map((s) => `${s.technicianId}:${s.startMinute}`)).size).toBe(options.length);
      for (const option of options) expect(checkPlanning({ ...option, status: "Programada" }, existing)).toBeNull();
    }
  });
});
