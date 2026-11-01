CREATE TABLE "availability_blocks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "availability_blocks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"technician_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	"reason" varchar(300) DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "block_dates_valid" CHECK ("availability_blocks"."start_date" <= "availability_blocks"."end_date"),
	CONSTRAINT "block_hours_valid" CHECK ("availability_blocks"."start_minute" >= 480 and "availability_blocks"."end_minute" <= 1020 and "availability_blocks"."start_minute" < "availability_blocks"."end_minute")
);
--> statement-breakpoint
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blocks_agenda_idx" ON "availability_blocks" USING btree ("technician_id","start_date","end_date","active");