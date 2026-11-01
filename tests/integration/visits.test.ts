import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabase, getDatabase } from "../../src/db/connection";
import { seedCatalogs } from "../../src/db/seed";
import { sites, technicians, visits } from "../../src/db/schema";
import { visitService } from "../../src/server/visits";
import { POST, GET } from "../../src/app/api/visits/route";
import { PATCH } from "../../src/app/api/visits/[id]/route";
import { operationsService } from "../../src/server/operations";
import { visitTypes } from "../../src/db/schema";
import { readFileSync, readdirSync } from "node:fs";
import { PATCH as editSite } from "../../src/app/api/sites/[id]/route";
import { POST as addType } from "../../src/app/api/types/route";
import { POST as addNote } from "../../src/app/api/visits/[id]/notes/route";
import { GET as getDetail } from "../../src/app/api/visits/[id]/route";

config({ path: ".env.local", quiet: true });
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error("Configura TEST_DATABASE_URL para ejecutar integración con PostgreSQL real.");
const testDatabase = new URL(testUrl).pathname;
if (!testDatabase.endsWith("_test") || (process.env.DATABASE_URL && testDatabase === new URL(process.env.DATABASE_URL).pathname)) {
  throw new Error("Las pruebas requieren una base separada cuyo nombre termine en _test. No se tocará la base de la aplicación.");
}
// This process is isolated from Next. Route handlers now use the dedicated test DB.
process.env.DATABASE_URL = testUrl;
const first = createDatabase(testUrl);
const second = createDatabase(testUrl);
const service = visitService(first.db);
const independentService = visitService(second.db);
const operations = operationsService(first.db);
const input = { technicianId: 1, siteId: 1, date: "2026-11-02", startTime: "09:00", duration: 60 };
const request = (body: unknown, origin = "http://localhost:3000") => new Request("http://localhost:3000/api/visits", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });

beforeAll(async () => {
  await migrate(first.db, { migrationsFolder: "./drizzle" });
  await seedCatalogs(first.db);
});
beforeEach(async () => {
  // Deliberately disposable fixtures, only in the guarded *_test database.
  await first.db.delete(visits);
  await first.db.delete(visitTypes);
});

describe("AM-05/06/07 · Fichas, tipos y seguimiento", () => {
  it("actualiza el esquema original conservando visitas programadas y canceladas", async () => {
    // Isolated schema inside the guarded disposable DB; exact migration SQL,
    // with only its namespace changed so the app schema cannot be affected.
    await first.client.begin(async (tx) => {
      await tx`create schema upgrade_test`;
      await tx`set local search_path to upgrade_test`;
      const files = readdirSync("./drizzle").filter((f) => f.endsWith(".sql")).sort();
      const apply = async (file: string) => {
        const content = readFileSync(`./drizzle/${file}`, "utf8").replaceAll('"public".', '"upgrade_test".');
        for (const statement of content.split("--> statement-breakpoint")) if (statement.trim()) await tx.unsafe(statement);
      };
      await apply(files[0]);
      await tx`insert into technicians (id, name) values (1, 'Anterior')`;
      await tx`insert into sites (id, name, municipality) values (1, 'Anterior', 'Terrassa')`;
      await tx`insert into visits (technician_id, site_id, date, start_minute, duration, status) values (1, 1, '2026-11-02', 540, 60, 'Programada'), (1, 1, '2026-11-02', 600, 30, 'Cancelada')`;
      const before = await tx`select id, technician_id, site_id, date::text, start_minute, duration, status, created_at from visits order by id`;
      for (const file of files.slice(1)) await apply(file);
      const after = await tx`select id, technician_id, site_id, date::text, start_minute, duration, status, created_at from visits order by id`;
      expect(after).toEqual(before);
      expect(await tx`select type_id, type_name from visits`).toEqual([{ type_id: null, type_name: null }, { type_id: null, type_name: null }]);
      await tx`drop schema upgrade_test cascade`;
    });
  });
  it("valida las nuevas rutas HTTP y lee el detalle persistido", async () => {
    const context = { params: Promise.resolve({ id: "1" }) };
    expect((await editSite(request({ address: "", contact: "", phone: "", accessNotes: "" }), context)).status).toBe(200);
    expect((await editSite(request({ address: "", contact: "", phone: "javascript:alert(1)", accessNotes: "" }), context)).status).toBe(400);
    expect((await addType(request({ name: "Prueba API", duration: 45, instructions: "", active: true }))).status).toBe(201);
    const visit = await service.create(input);
    const visitContext = { params: Promise.resolve({ id: String(visit.id) }) };
    expect((await addNote(request({ kind: "Nota", body: "API" }), visitContext)).status).toBe(201);
    const response = await getDetail(request({}), visitContext);
    expect(response.status).toBe(200);
    expect((await response.json()).annotations[0].body).toBe("API");
  });
  it("edita datos opcionales de una obra sin alterar su identidad", async () => {
    const site = await operations.updateSite(1, { address: "Calle de prueba 1", contact: "Ana", phone: "+34 600 123 456", accessNotes: "Acceso por el norte" });
    expect(site).toMatchObject({ id: 1, name: "Residencial Can Roca", address: "Calle de prueba 1" });
    expect((await independentService.catalogs()).sites.find((s) => s.id === 1)?.phone).toBe("+34 600 123 456");
    await expect(operations.updateSite(2147483647, { address: "", contact: "", phone: "", accessNotes: "" })).rejects.toMatchObject({ code: "SITE_NOT_FOUND" });
  });
  it("conserva la duración manual e historial del tipo aunque cambie o se desactive", async () => {
    const type = await operations.createType({ name: "Inspección", duration: 60, instructions: "Revisar acceso", active: true });
    const visit = await service.create({ ...input, typeId: type.id, duration: 47 });
    await operations.updateType(type.id, { name: "Inspección larga", duration: 90, instructions: "Otra pauta", active: false });
    const detail = await operations.detail(visit.id);
    expect(detail.visit).toMatchObject({ duration: 47, typeId: type.id, typeName: "Inspección", typeInstructions: "Revisar acceso" });
    await expect(service.create({ ...input, technicianId: 2, typeId: type.id })).rejects.toMatchObject({ code: "TYPE_UNAVAILABLE" });
    expect((await service.create({ ...input, technicianId: 2 })).typeId).toBeNull();
  });
  it("añade nota, incidencia y resultado sin cambiar disponibilidad ni perderlos al cancelar", async () => {
    const visit = await service.create(input);
    for (const kind of ["Nota", "Incidencia", "Resultado"]) await operations.annotate(visit.id, { kind, body: `<b>${kind}</b>` });
    await expect(service.create(input)).rejects.toMatchObject({ code: "OVERLAP" });
    await service.cancel(visit.id);
    const detail = await operations.detail(visit.id);
    expect(detail.visit.status).toBe("Cancelada");
    expect(detail.annotations.map((a) => a.body)).toEqual(["<b>Nota</b>", "<b>Incidencia</b>", "<b>Resultado</b>"]);
    await service.create(input);
    await expect(operations.annotate(visit.id, { kind: "Nota", body: " " })).rejects.toThrow();
    await expect(operations.detail(2147483647)).rejects.toMatchObject({ code: "VISIT_NOT_FOUND" });
  });
});
afterAll(async () => {
  await first.db.delete(visits);
  await Promise.all([first.client.end(), second.client.end(), getDatabase().$client.end()]);
});

describe("INT-01 · Persistencia relacional", () => {
  it("aplica migraciones y semilla repetible sin duplicar catálogos", async () => {
    await seedCatalogs(first.db);
    expect(await first.db.select().from(technicians)).toHaveLength(4);
    expect(await first.db.select().from(sites)).toHaveLength(4);
  });
  it("la base rechaza duraciones inválidas, fin fuera de jornada y referencias inexistentes", async () => {
    const valid = { technicianId: 1, siteId: 1, date: input.date, startMinute: 540, duration: 60 };
    for (const changes of [{ duration: 0 }, { duration: -1 }, { startMinute: 1000 }, { technicianId: 99999 }]) {
      await expect(first.db.insert(visits).values({ ...valid, ...changes })).rejects.toThrow();
    }
    expect(await service.list()).toHaveLength(0);
  });
  it("la semilla preserva una visita existente", async () => {
    await service.create(input);
    await seedCatalogs(first.db);
    expect(await service.list()).toHaveLength(1);
  });
});

describe("INT-02/03 · Entrada real de servidor", () => {
  it("crea por POST y persiste para otra conexión", async () => {
    const response = await POST(request(input));
    expect(response.status).toBe(201);
    const list = await independentService.list();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ status: "Programada", date: input.date, startMinute: 540, duration: 60 });
  });
  it.each([
    [{ duration: 0 }, 400], [{ startTime: "07:59" }, 409], [{ startTime: "16:30", duration: 31 }, 409],
    [{ technicianId: 99999 }, 404], [{ siteId: 99999 }, 404], [{ date: "2026-02-30" }, 400],
    [{ status: "Cancelada" }, 400],
  ])("rechaza %j sin guardar", async (changes, status) => {
    const response = await POST(request({ ...input, ...changes }));
    expect(response.status).toBe(status);
    expect((await response.json()).error.message).toBeTruthy();
    expect(await service.list()).toHaveLength(0);
  });
  it("rechaza solapamiento y desplazamiento por petición directa", async () => {
    await service.create(input);
    expect((await POST(request({ ...input, startTime: "09:30" }))).status).toBe(409);
    expect((await POST(request({ ...input, siteId: 2, startTime: "10:15" }))).status).toBe(409);
    expect((await POST(request({ ...input, siteId: 2, startTime: "10:30" }))).status).toBe(201);
    expect(await service.list()).toHaveLength(2);
  });
  it("rechaza JSON mal formado y peticiones mutantes de otro origen", async () => {
    const malformed = new Request("http://localhost:3000/api/visits", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
    expect((await POST(malformed)).status).toBe(400);
    expect((await POST(request(input, "https://otro-sitio.example"))).status).toBe(403);
    expect(await service.list()).toHaveLength(0);
  });
});

describe("INT-04 · Cancelar y liberar", () => {
  it("cancela por PATCH, conserva la fila y permite reutilizar el horario", async () => {
    const saved = await service.create(input);
    const cancel = () => PATCH(new Request(`http://localhost:3000/api/visits/${saved.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Cancelada" }) }), { params: Promise.resolve({ id: String(saved.id) }) });
    expect((await cancel()).status).toBe(200);
    expect((await cancel()).status).toBe(200);
    await independentService.create(input);
    const rows = await service.list();
    expect(rows).toHaveLength(2);
    expect(rows.find((v) => v.id === saved.id)?.status).toBe("Cancelada");
    const [persisted] = await second.db.select().from(visits).where(eq(visits.id, saved.id));
    expect(persisted.status).toBe("Cancelada");
  });
  it("responde 404 ante una visita inexistente", async () => {
    await expect(service.cancel(2147483647)).rejects.toMatchObject({ code: "VISIT_NOT_FOUND" });
  });
});

describe("INT-05 · Listado y filtros", () => {
  it("ordena y filtra por fecha/técnico, combina y conserva canceladas", async () => {
    await service.create({ ...input, date: "2026-11-03" });
    await service.create({ ...input, startTime: "11:00" });
    const cancelled = await service.create(input);
    await service.cancel(cancelled.id);
    await service.create({ ...input, technicianId: 2 });
    expect((await service.list()).map((v) => `${v.date}:${v.startMinute}`)).toEqual(["2026-11-02:540", "2026-11-02:540", "2026-11-02:660", "2026-11-03:540"]);
    expect(await service.list({ date: "2026-11-02" })).toHaveLength(3);
    expect(await service.list({ technicianId: 1 })).toHaveLength(3);
    const response = await GET(new Request("http://localhost:3000/api/visits?date=2026-11-02&technicianId=1"));
    expect(response.status).toBe(200);
    const { visits: filtered } = await response.json();
    expect(filtered).toHaveLength(2);
    expect(filtered[0].status).toBe("Cancelada");
    expect(await service.list({ technicianId: 3 })).toHaveLength(0);
    expect((await GET(new Request("http://localhost:3000/api/visits?technicianId=oops"))).status).toBe(400);
  });
});

describe("INT-06 · Concurrencia con conexiones independientes", () => {
  it.each(["09:00", "10:15"])("solo permite una de dos incompatibles (%s)", async (startTime) => {
    const results = await Promise.allSettled([
      service.create(input), independentService.create({ ...input, siteId: 2, startTime }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
    expect(await service.list()).toHaveLength(1);
  });
  it("también protege una agenda previamente ocupada", async () => {
    await service.create({ ...input, startTime: "08:00", duration: 30 });
    const results = await Promise.allSettled([service.create(input), independentService.create(input)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await service.list()).toHaveLength(2);
  });
  it("técnicos diferentes pueden reservar a la vez", async () => {
    await Promise.all([service.create(input), independentService.create({ ...input, technicianId: 2 })]);
    expect(await service.list()).toHaveLength(2);
  });
  it("usa un motor PostgreSQL real", async () => {
    const result = await first.db.execute(sql`select version() as version`);
    expect(result[0].version).toContain("PostgreSQL");
  });
});
