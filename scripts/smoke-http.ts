import { config } from "dotenv";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import assert from "node:assert/strict";
import { eq, inArray } from "drizzle-orm";
import { createDatabase } from "../src/db/connection";
import { availabilityBlocks, sites, visits, visitTypes } from "../src/db/schema";

config({ path: ".env.local", quiet: true });
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith("_test") || (process.env.DATABASE_URL && new URL(testUrl).pathname === new URL(process.env.DATABASE_URL).pathname)) throw new Error("HTTP smoke requiere una base distinta y desechable *_test.");
const { db, client } = createDatabase(testUrl);
const reservation = createServer(); reservation.listen(0, "127.0.0.1"); await once(reservation, "listening");
const address = reservation.address(); if (!address || typeof address === "string") throw new Error("No se pudo elegir un puerto de prueba.");
const port = address.port; await new Promise<void>((resolve) => reservation.close(() => resolve()));
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { env: { ...process.env, DATABASE_URL: testUrl, NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"] });
const origin = `http://127.0.0.1:${port}`;
const ids: number[] = [], typeIds: number[] = [], blockIds: number[] = [];
const checks: string[] = [];
let originalSite: typeof sites.$inferSelect | undefined;
const input = { technicianId: 1, siteId: 1, date: "2098-06-15", startTime: "09:00", duration: 45 };

async function call(path: string, method = "GET", data?: unknown, expected = 200) {
  const response = await fetch(`${origin}${path}`, { method, headers: { "Content-Type": "application/json", Origin: origin }, ...(data === undefined ? {} : { body: JSON.stringify(data) }), signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, expected, `${method} ${path}: HTTP inesperado`);
  return response.json();
}
try {
  // Only test our own child after it reports a successful bind; a port race
  // cannot make these writes hit an unrelated server.
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("La versión compilada no arrancó en 20 s.")), 20000);
    child.once("error", () => { clearTimeout(timeout); reject(new Error("No se pudo iniciar Next para HTTP smoke.")); });
    child.once("exit", () => { clearTimeout(timeout); reject(new Error("Next terminó antes de las pruebas HTTP.")); });
    child.stdout.on("data", (chunk: Buffer) => { if (chunk.toString().includes("Ready in")) { clearTimeout(timeout); resolve(); } });
    child.stderr.on("data", () => { /* Never echo environment/driver output. */ });
  });
  [originalSite] = await db.select().from(sites).where(eq(sites.id, 1));
  assert(originalSite, "Ejecuta migración y semilla en la base de pruebas antes del smoke.");
  assert.equal((await db.select({ id: visits.id }).from(visits)).length, 0, "No ejecutes smoke junto con integración ni con otras reservas de prueba.");
  const page = await fetch(origin); assert.equal(page.status, 200); const html = await page.text();
  assert.equal((html.match(/class="day-tech"/g) ?? []).length, 4); assert(html.includes("Avisos")); checks.push("Página compilada, cuatro columnas y avisos");
  const catalogs = await call("/api/catalogs"); assert.equal(catalogs.technicians.length, 4);
  await call("/api/sites/1", "PATCH", { address: "Calle de prueba HTTP 1", contact: "Contacto ficticio", phone: "+34 600 111 222", accessNotes: "Puerta de prueba" });
  const { type } = await call("/api/types", "POST", { name: "Tipo smoke HTTP", duration: 45, instructions: "Pauta de prueba", active: true }, 201); typeIds.push(type.id);
  const { block } = await call("/api/blocks", "POST", { technicianId: 4, startDate: input.date, endDate: input.date, startTime: "08:00", endTime: "17:00", reason: "Smoke HTTP" }, 201); blockIds.push(block.id);
  const { suggestions } = await call("/api/suggestions", "POST", input); assert.equal(suggestions[0].startMinute, 540);
  const { visit } = await call("/api/visits", "POST", { ...input, typeId: type.id }, 201); ids.push(visit.id);
  await call(`/api/visits/${visit.id}/notes`, "POST", { kind: "Incidencia", body: "<b>Texto literal de prueba</b>" }, 201);
  const detail = await call(`/api/visits/${visit.id}`); assert.equal(detail.site.address, "Calle de prueba HTTP 1"); assert.equal(detail.visit.typeInstructions, "Pauta de prueba");
  checks.push("Ficha, tipo, bloqueo, propuesta, reserva y nota por HTTP real");
  const movedInput = { ...input, technicianId: 2, startTime: "11:00" };
  await call(`/api/visits/${visit.id}`, "PUT", { ...movedInput, version: 1 });
  await call(`/api/visits/${visit.id}`, "PUT", { ...input, version: 1 }, 409);
  await call("/api/visits", "POST", movedInput, 409);
  await call("/api/visits", "POST", { ...input, technicianId: 4 }, 409);
  checks.push("Reprogramación, versión obsoleta, solapamiento y bloqueo");
  await call(`/api/visits/${visit.id}`, "PATCH", { status: "Cancelada", version: 2 });
  const cancelled = await call(`/api/visits/${visit.id}`); assert.equal(cancelled.visit.status, "Cancelada"); assert.equal(cancelled.annotations[0].body, "<b>Texto literal de prueba</b>"); assert.equal(cancelled.history.length, 3);
  const reused = await call("/api/visits", "POST", movedInput, 201); ids.push(reused.visit.id);
  await call(`/api/blocks/${block.id}`, "PATCH", { active: false });
  const { blocks } = await call(`/api/blocks?date=${input.date}`); assert.equal(blocks.length, 0);
  const notifications = await call("/api/notifications"); assert(notifications.activity.some((n: { visitId?: number }) => n.visitId === visit.id)); assert(notifications.activity.some((n: { blockId?: number }) => n.blockId === block.id));
  checks.push("Cancelación persistente, notas, historial, hueco liberado y avisos");
  console.log(JSON.stringify({ result: "ok", checks, database: "isolated_test", userDataModified: false }, null, 2));
} finally {
  child.kill("SIGTERM");
  try {
    if (ids.length) await db.delete(visits).where(inArray(visits.id, ids));
    if (blockIds.length) await db.delete(availabilityBlocks).where(inArray(availabilityBlocks.id, blockIds));
    if (typeIds.length) await db.delete(visitTypes).where(inArray(visitTypes.id, typeIds));
    if (originalSite) await db.update(sites).set({ address: originalSite.address, contact: originalSite.contact, phone: originalSite.phone, accessNotes: originalSite.accessNotes }).where(eq(sites.id, 1));
  } finally { await client.end(); }
}
