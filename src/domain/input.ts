import { z } from "zod";

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Introduce una fecha válida.").refine((value) => {
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && !value.startsWith("0000");
}, "La fecha no existe en el calendario.");

export const idSchema = z.number().int().positive().max(2147483647);

export const visitInputSchema = z.strictObject({
  technicianId: idSchema,
  siteId: idSchema,
  typeId: idSchema.optional(),
  date: dateSchema,
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Introduce una hora válida (HH:mm)."),
  duration: z.number().int("La duración debe ser un número entero de minutos.").positive("La duración debe ser mayor que cero.").max(540, "La duración no puede superar la jornada de 9 horas."),
}).transform(({ startTime, ...values }) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  return { ...values, startMinute: hours * 60 + minutes };
});

export const filterSchema = z.strictObject({
  technicianId: z.coerce.number().int().positive().max(2147483647).optional(),
  date: dateSchema.optional(),
});

export type VisitInput = z.output<typeof visitInputSchema>;
export type VisitFilters = z.output<typeof filterSchema>;
