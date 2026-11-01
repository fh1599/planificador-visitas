CREATE TYPE "public"."visit_event_kind" AS ENUM('Programada', 'Reprogramada', 'Cancelada');--> statement-breakpoint
CREATE TABLE "visit_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "visit_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"visit_id" integer NOT NULL,
	"kind" "visit_event_kind" NOT NULL,
	"before" jsonb,
	"after" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "visit_events" ADD CONSTRAINT "visit_events_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "visit_events_visit_idx" ON "visit_events" USING btree ("visit_id","created_at");--> statement-breakpoint
CREATE INDEX "visit_events_recent_idx" ON "visit_events" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visit_version_positive" CHECK ("visits"."version" > 0);