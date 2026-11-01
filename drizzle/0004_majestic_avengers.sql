CREATE TYPE "public"."block_event_kind" AS ENUM('Bloqueada', 'Liberada');--> statement-breakpoint
CREATE TABLE "block_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "block_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"block_id" integer NOT NULL,
	"kind" "block_event_kind" NOT NULL,
	"created_at" timestamp with time zone DEFAULT clock_timestamp() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visit_events" ALTER COLUMN "created_at" SET DEFAULT clock_timestamp();--> statement-breakpoint
ALTER TABLE "block_events" ADD CONSTRAINT "block_events_block_id_availability_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."availability_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "block_events_recent_idx" ON "block_events" USING btree ("created_at");