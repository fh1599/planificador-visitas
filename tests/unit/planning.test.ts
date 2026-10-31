import { describe, expect, it } from "vitest";
import { checkPlanning, type PlannedVisit } from "../../src/domain/planning";

const base: PlannedVisit = {
  technicianId: 1, siteId: 1, date: "2026-11-02", startMinute: 540, duration: 60, status: "Programada",
};
const visit = (changes: Partial<PlannedVisit> = {}): PlannedVisit => ({ ...base, ...changes });

describe("UNIT-02 · Jornada", () => {
  it.each([
    [479, 30, "WORKING_HOURS"], [480, 30, undefined],
    [990, 30, undefined], [990, 31, "WORKING_HOURS"],
    [480, 540, undefined], [480, 541, "WORKING_HOURS"],
  ])("inicio %i, duración %i → %s", (startMinute, duration, code) => {
    expect(checkPlanning(visit({ startMinute, duration }), [])?.code).toBe(code);
  });
});

describe("UNIT-03 · Solapamientos del mismo técnico", () => {
  it.each([
    [510, 60], [570, 60], [550, 10], [510, 120], [540, 60], [540, 30],
  ])("rechaza %i durante %i frente a 09:00–10:00", (startMinute, duration) => {
    expect(checkPlanning(visit({ startMinute, duration }), [base])?.code).toBe("OVERLAP");
  });
});

describe("UNIT-04 · Consecutivas y técnicos independientes", () => {
  it.each([480, 600])("permite consecutiva misma obra a %i", (startMinute) => {
    expect(checkPlanning(visit({ startMinute }), [base])).toBeNull();
  });
  it("permite simultáneas de distintos técnicos", () => {
    expect(checkPlanning(visit({ technicianId: 2 }), [base])).toBeNull();
  });
});

describe("UNIT-05/06 · Desplazamientos en ambos sentidos", () => {
  it.each([15, 29, 30, 31])("margen posterior de %i minutos", (gap) => {
    const result = checkPlanning(visit({ siteId: 2, startMinute: 600 + gap }), [base]);
    expect(result?.code).toBe(gap < 30 ? "TRAVEL_TIME" : undefined);
  });
  it.each([15, 29, 30, 31])("margen anterior de %i minutos", (gap) => {
    const future = visit({ startMinute: 720 });
    const result = checkPlanning(visit({ siteId: 2, startMinute: 660 - gap }), [future]);
    expect(result?.code).toBe(gap < 30 ? "TRAVEL_TIME" : undefined);
  });
  it("rechaza si cumple con la anterior pero no con la posterior", () => {
    expect(checkPlanning(visit({ siteId: 2, startMinute: 630 }), [base, visit({ startMinute: 705 })])?.code).toBe("TRAVEL_TIME");
  });
  it("acepta al insertar entre dos visitas con márgenes exactos", () => {
    expect(checkPlanning(visit({ siteId: 2, startMinute: 630 }), [visit({ startMinute: 720 }), base])).toBeNull();
  });
  it("explica la regla incumplida", () => {
    expect(checkPlanning(visit({ siteId: 2, startMinute: 615 }), [base])?.message).toContain("30 minutos");
  });
});

describe("UNIT-07 · Visitas que no bloquean", () => {
  it.each([
    { status: "Cancelada" as const }, { date: "2026-11-03" }, { technicianId: 2 },
  ])("ignora %j", (changes) => {
    expect(checkPlanning(base, [visit(changes)])).toBeNull();
  });
  it("una cancelada en otra obra tampoco exige desplazamiento", () => {
    expect(checkPlanning(visit({ startMinute: 600, siteId: 2 }), [visit({ status: "Cancelada" })])).toBeNull();
  });
});
