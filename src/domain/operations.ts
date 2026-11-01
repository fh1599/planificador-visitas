import { z } from "zod";

export const siteProfileSchema = z.strictObject({
  address: z.string().trim().max(300),
  contact: z.string().trim().max(120),
  phone: z.string().trim().max(40).refine((value) => !value || (/^[+\d().\s-]+$/.test(value) && /\d/.test(value)), "Introduce un teléfono válido o déjalo vacío."),
  accessNotes: z.string().trim().max(2000),
});

export const visitTypeSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  duration: z.number().int().min(1).max(540),
  instructions: z.string().trim().max(2000),
  active: z.boolean(),
});

export const annotationSchema = z.strictObject({
  kind: z.enum(["Nota", "Incidencia", "Resultado"]),
  body: z.string().trim().min(1).max(4000),
});
