import { describe, expect, it } from "vitest";
import { dayEntries, shiftDate, timelinePosition } from "../../src/domain/agenda";

const visit = { id: 1, technicianId: 1, siteId: 1, siteName: "Obra A", date: "2026-11-02", startMinute: 480, duration: 60, status: "Programada" as const };
describe("AM-03 · Representación diaria", () => {
  it("coloca exactamente los extremos de la jornada y un minuto", () => {
    expect(timelinePosition(480, 1020)).toEqual({ top: 0, height: 100 });
    expect(timelinePosition(1019, 1020).top + timelinePosition(1019, 1020).height).toBeCloseTo(100);
    expect(timelinePosition(480, 481).height).toBeCloseTo(100 / 540);
  });
  it("filtra técnico/fecha y deja las canceladas fuera de la ocupación", () => {
    expect(dayEntries("2026-11-02", 1, [visit, { ...visit, id: 2, technicianId: 2 }, { ...visit, id: 3, status: "Cancelada" }, { ...visit, id: 4, date: "2026-11-03" }], []).map((e) => e.id)).toEqual(["visit-1"]);
  });
  it("distingue bloqueo y viaje en un tramo realmente disponible", () => {
    const second = { ...visit, id: 2, siteId: 2, siteName: "Obra B", startMinute: 600 };
    const block = { id: 1, technicianId: 1, startDate: visit.date, endDate: visit.date, startMinute: 540, endMinute: 570, active: true, reason: "Ausencia" };
    const entries = dayEntries(visit.date, 1, [visit, second], [block]);
    expect(entries.find((e) => e.kind === "travel")).toMatchObject({ startMinute: 570, endMinute: 600 });
    expect(entries.find((e) => e.kind === "block")).toMatchObject({ startMinute: 540, endMinute: 570, label: "Ausencia" });
  });
  it("navega fechas civiles sin desfases estacionales", () => {
    expect(shiftDate("2026-03-29", -1)).toBe("2026-03-28");
    expect(shiftDate("2026-10-25", 1)).toBe("2026-10-26");
    expect(shiftDate("2026-12-31", 1)).toBe("2027-01-01");
  });
});
