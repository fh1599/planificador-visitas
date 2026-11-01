import { describe, expect, it } from "vitest";
import { annotationSchema, siteProfileSchema, visitTypeSchema } from "../../src/domain/operations";

describe("AM-05/06/07 · Datos opcionales", () => {
  it("permite una ficha vacía y teléfonos internacionales", () => {
    expect(siteProfileSchema.parse({ address: "", contact: "", phone: "", accessNotes: "" }).phone).toBe("");
    expect(siteProfileSchema.parse({ address: " Calle A ", contact: "Ana", phone: "+34 600 123 456", accessNotes: "Puerta norte" }).address).toBe("Calle A");
  });
  it("limita texto, teléfono y campos no editables", () => {
    const profile = { address: "", contact: "", phone: "", accessNotes: "" };
    for (const patch of [{ phone: "no es teléfono" }, { accessNotes: "x".repeat(2001) }, { name: "Cambio no permitido" }]) {
      expect(siteProfileSchema.safeParse({ ...profile, ...patch }).success).toBe(false);
    }
  });
  it("conserva una anotación como texto y exige contenido solo al añadirla", () => {
    expect(annotationSchema.parse({ kind: "Incidencia", body: " <script>alert(1)</script> " }).body).toBe("<script>alert(1)</script>");
    expect(annotationSchema.safeParse({ kind: "Nota", body: "   " }).success).toBe(false);
    expect(annotationSchema.safeParse({ kind: "Nota", body: "x".repeat(4001) }).success).toBe(false);
    expect(annotationSchema.safeParse({ kind: "Completada", body: "Fin" }).success).toBe(false);
  });
  it("valida tipos y duraciones sin imponer una plantilla a las visitas", () => {
    expect(visitTypeSchema.parse({ name: " Revisión ", duration: 45, instructions: "", active: true }).name).toBe("Revisión");
    for (const patch of [{ name: " " }, { duration: 0 }, { duration: 541 }, { duration: 1.5 }]) {
      expect(visitTypeSchema.safeParse({ name: "Revisión", duration: 60, instructions: "", active: true, ...patch }).success).toBe(false);
    }
  });
});
