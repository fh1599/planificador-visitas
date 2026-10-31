import { describe, expect, it } from "vitest";
import { visitInputSchema, filterSchema } from "../../src/domain/input";
import { formatMinute, localDate } from "../../src/domain/time";

const input = { technicianId: 1, siteId: 1, date: "2026-11-02", startTime: "09:00", duration: 60 };

describe("UNIT-01 · Datos de entrada", () => {
  it("acepta entrada completa y transforma la hora en minutos", () => {
    expect(visitInputSchema.parse(input).startMinute).toBe(540);
  });
  it.each([0, -1, 1.5, NaN, Infinity, "60", null])("rechaza duración %j", (duration) => {
    expect(visitInputSchema.safeParse({ ...input, duration }).success).toBe(false);
  });
  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "2026-00-01", "02/11/2026", "", "2026-11-02T00:00:00Z"])("rechaza fecha %s", (date) => {
    expect(visitInputSchema.safeParse({ ...input, date }).success).toBe(false);
  });
  it("acepta un día bisiesto real", () => {
    expect(visitInputSchema.safeParse({ ...input, date: "2028-02-29" }).success).toBe(true);
  });
  it.each(["9:00", "24:00", "09:60", "09:00:00", ""])("rechaza hora %s", (startTime) => {
    expect(visitInputSchema.safeParse({ ...input, startTime }).success).toBe(false);
  });
  it.each(["technicianId", "siteId", "date", "startTime", "duration"])("exige %s", (key) => {
    expect(visitInputSchema.safeParse({ ...input, [key]: undefined }).success).toBe(false);
  });
  it.each([0, -1, 1.2, "1", null])("rechaza identificador %j", (technicianId) => {
    expect(visitInputSchema.safeParse({ ...input, technicianId }).success).toBe(false);
  });
  it("solo permite campos declarados, incluido el estado fijado por servidor", () => {
    expect(visitInputSchema.safeParse({ ...input, status: "Cancelada" }).success).toBe(false);
  });
  it("permite filtros vacíos y combinados", () => {
    expect(filterSchema.parse({})).toEqual({});
    expect(filterSchema.parse({ technicianId: "2", date: "2026-11-02" }).technicianId).toBe(2);
  });
  it("rechaza filtros de identificador o fecha inválidos", () => {
    expect(filterSchema.safeParse({ technicianId: "1x" }).success).toBe(false);
    expect(filterSchema.safeParse({ date: "2026-02-30" }).success).toBe(false);
  });
});

describe("Fechas y presentación", () => {
  it("formatea límites sin conversiones de zona horaria", () => {
    expect(formatMinute(480)).toBe("08:00");
    expect(formatMinute(1020)).toBe("17:00");
  });
  it("calcula la fecha civil de Madrid cerca de medianoche", () => {
    expect(localDate(new Date("2026-10-30T23:30:00Z"))).toBe("2026-10-31");
    expect(localDate(new Date("2026-07-01T22:30:00Z"))).toBe("2026-07-02");
  });
});
