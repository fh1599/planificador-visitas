import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const visitStatus = pgEnum("visit_status", ["Programada", "Cancelada"]);

export const technicians = pgTable("technicians", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 120 }).notNull(),
});

export const sites = pgTable("sites", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 160 }).notNull(),
  municipality: varchar({ length: 120 }).notNull(),
  address: varchar({ length: 300 }).notNull().default(""),
  contact: varchar({ length: 120 }).notNull().default(""),
  phone: varchar({ length: 40 }).notNull().default(""),
  accessNotes: varchar("access_notes", { length: 2000 }).notNull().default(""),
});

export const visitTypes = pgTable("visit_types", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  duration: integer().notNull(),
  instructions: varchar({ length: 2000 }).notNull().default(""),
  active: boolean().notNull().default(true),
}, (table) => [check("type_duration_valid", sql`${table.duration} between 1 and 540`)]);

export const visits = pgTable("visits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  technicianId: integer("technician_id").notNull().references(() => technicians.id),
  siteId: integer("site_id").notNull().references(() => sites.id),
  date: date({ mode: "string" }).notNull(),
  startMinute: integer("start_minute").notNull(),
  duration: integer().notNull(),
  status: visitStatus().notNull().default("Programada"),
  typeId: integer("type_id").references(() => visitTypes.id),
  typeName: varchar("type_name", { length: 100 }),
  typeInstructions: varchar("type_instructions", { length: 2000 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("duration_valid", sql`${table.duration} between 1 and 540`),
  check("start_in_workday", sql`${table.startMinute} between 480 and 1019`),
  check("end_in_workday", sql`${table.startMinute} + ${table.duration} <= 1020`),
  index("visits_agenda_idx").on(table.technicianId, table.date, table.status),
  index("visits_date_time_idx").on(table.date, table.startMinute),
]);

export const annotationKind = pgEnum("annotation_kind", ["Nota", "Incidencia", "Resultado"]);
export const availabilityBlocks = pgTable("availability_blocks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  technicianId: integer("technician_id").notNull().references(() => technicians.id),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  startMinute: integer("start_minute").notNull(),
  endMinute: integer("end_minute").notNull(),
  reason: varchar({ length: 300 }).notNull().default(""),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("block_dates_valid", sql`${table.startDate} <= ${table.endDate}`),
  check("block_hours_valid", sql`${table.startMinute} >= 480 and ${table.endMinute} <= 1020 and ${table.startMinute} < ${table.endMinute}`),
  index("blocks_agenda_idx").on(table.technicianId, table.startDate, table.endDate, table.active),
]);

export const annotations = pgTable("annotations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  visitId: integer("visit_id").notNull().references(() => visits.id, { onDelete: "cascade" }),
  kind: annotationKind().notNull(),
  body: varchar({ length: 4000 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("annotations_visit_idx").on(table.visitId, table.createdAt),
  check("annotation_not_empty", sql`length(trim(${table.body})) > 0`),
]);
