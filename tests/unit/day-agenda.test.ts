import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DayAgenda } from "../../src/components/day-agenda";
import type { VisitRow } from "../../src/server/visits";

it("renderiza una visita corta accesible, escapa textos y excluye canceladas de la cuadrícula", () => {
  const visit: VisitRow = { id: 1, date: "2026-11-02", technicianId: 1, technicianName: "Ana", siteId: 1, siteName: "<img src=x onerror=alert(1)>", municipality: "Terrassa", startMinute: 480, duration: 1, status: "Programada", typeId: null, typeName: null, version: 1 };
  const html = renderToStaticMarkup(createElement(DayAgenda, { date: visit.date, technicianId: "", catalogs: { technicians: [{ id: 1, name: "Ana" }], sites: [], types: [] }, visits: [visit, { ...visit, id: 2, status: "Cancelada", siteName: "VISITA_CANCELADA" }], blocks: [], onDetail: () => {} }));
  expect(html).toContain("Acceso a visitas cortas");
  expect(html).toContain("Ver visita:");
  expect(html).toContain("08:00–08:01");
  expect(html).toContain("&lt;img");
  expect(html).not.toContain("<img");
  expect(html).not.toContain("VISITA_CANCELADA");
});
