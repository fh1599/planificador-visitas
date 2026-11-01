import { describe, expect, it } from "vitest";
import { upcomingReminders, parseReadKeys, markReadKeys } from "../../src/domain/notifications";
const visit = { id: 1, technicianId: 1, siteId: 1, date: "2026-11-02", startMinute: 540, duration: 60, status: "Programada" as const, version: 1, technicianName: "Ana", siteName: "Obra A" };

describe("AM-08 · Recordatorios con reloj controlado", () => {
  it("abre la ventana exactamente 30 minutos antes y la cierra después del inicio", () => {
    expect(upcomingReminders([visit], new Date("2026-11-02T07:29:59.999Z"))).toEqual([]);
    expect(upcomingReminders([visit], new Date("2026-11-02T07:30:00Z"))).toHaveLength(1);
    expect(upcomingReminders([visit], new Date("2026-11-02T08:00:00Z"))).toHaveLength(1);
    expect(upcomingReminders([visit], new Date("2026-11-02T08:00:00.001Z"))).toEqual([]);
  });
  it("usa Madrid en invierno, verano y cambio de día", () => {
    expect(upcomingReminders([{ ...visit, date: "2026-07-01" }], new Date("2026-07-01T06:30:00Z"))).toHaveLength(1);
    expect(upcomingReminders([{ ...visit, date: "2026-03-29" }], new Date("2026-03-29T06:30:00Z"))).toHaveLength(1);
    expect(upcomingReminders([{ ...visit, date: "2026-10-25" }], new Date("2026-10-25T07:30:00Z"))).toHaveLength(1);
    expect(upcomingReminders([visit], new Date("2026-11-01T23:30:00Z"))).toEqual([]);
  });
  it("invalida canceladas, fechas/horas anteriores y cambia la identidad tras reprogramar", () => {
    const now = new Date("2026-11-02T07:45:00Z");
    expect(upcomingReminders([{ ...visit, status: "Cancelada" }], now)).toEqual([]);
    expect(upcomingReminders([{ ...visit, startMinute: 600, version: 2 }], now)).toEqual([]);
    expect(upcomingReminders([{ ...visit, date: "2026-11-03" }], now)).toEqual([]);
    const first = upcomingReminders([visit], now)[0];
    expect(upcomingReminders([visit], now)[0].key).toBe(first.key);
    expect(upcomingReminders([{ ...visit, version: 2, technicianName: "Otro técnico" }], now)[0].key).not.toBe(first.key);
  });
  it("tolera lectura corrupta y evita duplicados al persistir por navegador", () => {
    expect(parseReadKeys("{" )).toEqual([]);
    expect(parseReadKeys('{"bad":true}')).toEqual([]);
    expect(parseReadKeys('[1,"event:1",null,"event:1"]')).toEqual(["event:1"]);
    expect(markReadKeys(["event:1"], ["event:1", "reminder:2:1"])).toEqual(["event:1", "reminder:2:1"]);
    expect(markReadKeys([], Array.from({ length: 1100 }, (_, i) => `event:${i}`))).toHaveLength(1000);
  });
});
