import { describe, expect, it } from "vitest";
import { assertMutationRequest } from "../../src/server/http";

describe("REG-001 · Origen de peticiones en Next.js", () => {
  it("acepta el origen externo cuando Next normaliza la URL a localhost", () => {
    const request = new Request("http://localhost:3000/api/visits", {
      method: "POST", headers: { Host: "127.0.0.1:3000", Origin: "http://127.0.0.1:3000", "Content-Type": "application/json", "Sec-Fetch-Site": "same-origin" },
    });
    expect(() => assertMutationRequest(request)).not.toThrow();
  });
  it.each(["https://otro.example", "http://127.0.0.1:3001", "https://127.0.0.1:3000", "null"])("sigue rechazando %s", (origin) => {
    const request = new Request("http://localhost:3000/api/visits", { method: "POST", headers: { Host: "127.0.0.1:3000", Origin: origin, "Content-Type": "application/json" } });
    expect(() => assertMutationRequest(request)).toThrow("desde la aplicación");
  });
});
