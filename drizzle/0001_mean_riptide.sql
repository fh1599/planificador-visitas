CREATE TYPE "public"."annotation_kind" AS ENUM('Nota', 'Incidencia', 'Resultado');--> statement-breakpoint
CREATE TABLE "annotations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "annotations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"visit_id" integer NOT NULL,
	"kind" "annotation_kind" NOT NULL,
	"body" varchar(4000) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "annotation_not_empty" CHECK (length(trim("annotations"."body")) > 0)
);
--> statement-breakpoint
CREATE TABLE "visit_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "visit_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"duration" integer NOT NULL,
	"instructions" varchar(2000) DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "type_duration_valid" CHECK ("visit_types"."duration" between 1 and 540)
);
--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "address" varchar(300) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "contact" varchar(120) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "phone" varchar(40) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "access_notes" varchar(2000) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "type_id" integer;--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "type_name" varchar(100);--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "type_instructions" varchar(2000);--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "annotations_visit_idx" ON "annotations" USING btree ("visit_id","created_at");--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_type_id_visit_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."visit_types"("id") ON DELETE no action ON UPDATE no action;