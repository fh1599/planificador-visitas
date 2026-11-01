import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../../src/client/api";

afterEach(() => vi.unstubAllGlobals());

describe("REG-002 · Conexión con la agenda", () => {
  it.each([new TypeError("Failed to fetch"), new Error("Network connection lost")])("explica una conexión fallida sin reintentar una escritura automáticamente: %s", async (failure) => {
    const fetch = vi.fn().mockRejectedValue(failure);
    vi.stubGlobal("fetch", fetch);
    await expect(api("/api/visits", { method: "POST" })).rejects.toThrow("No se ha recibido respuesta de la agenda");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([new SyntaxError("Unexpected token <"), new TypeError("Failed to fetch")])("no confirma un guardado si su respuesta no se puede leer: %s", async (failure) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(failure) }));
    await expect(api("/api/visits", { method: "POST" })).rejects.toThrow("No se ha podido confirmar el resultado");
  });

  it.each([
    [409, "El técnico ya tiene una visita de 09:00 a 10:00."],
    [503, "No se ha podido conectar con la agenda."],
  ])("conserva la explicación recibida del servidor (%s)", async (status, message) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { message } }, { status })));
    await expect(api("/api/visits")).rejects.toThrow(message);
  });

  it("usa un mensaje seguro si un error HTTP no tiene explicación", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(null, { status: 502 })));
    await expect(api("/api/visits")).rejects.toThrow("No se pudo completar la operación");
  });

  it("devuelve un guardado que el servidor sí confirmó", async () => {
    const data = { visit: { id: 123, status: "Programada" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(data, { status: 201 })));
    await expect(api("/api/visits", { method: "POST" })).resolves.toEqual(data);
  });
});
