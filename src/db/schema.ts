import { sql } from "drizzle-orm";
import { check, date, index, integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const visitStatus = pgEnum("visit_status", ["Programada", "Cancelada"]);

export const technicians = pgTable("technicians", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 120 }).notNull(),
});

export const sites = pgTable("sites", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 160 }).notNull(),
  municipality: varchar({ length: 120 }).notNull(),
});

export const visits = pgTable("visits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  technicianId: integer("technician_id").notNull().references(() => technicians.id),
  siteId: integer("site_id").notNull().references(() => sites.id),
  date: date({ mode: "string" }).notNull(),
  startMinute: integer("start_minute").notNull(),
  duration: integer().notNull(),
  status: visitStatus().notNull().default("Programada"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("duration_valid", sql`${table.duration} between 1 and 540`),
  check("start_in_workday", sql`${table.startMinute} between 480 and 1019`),
  check("end_in_workday", sql`${table.startMinute} + ${table.duration} <= 1020`),
  index("visits_agenda_idx").on(table.technicianId, table.date, table.status),
  index("visits_date_time_idx").on(table.date, table.startMinute),
]);
