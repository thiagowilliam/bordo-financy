CREATE TABLE "trip_budget_changes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"trip_id" uuid NOT NULL,
	"from_cents" bigint NOT NULL,
	"to_cents" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip_budget_changes" ADD CONSTRAINT "trip_budget_changes_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trip_budget_changes_trip_id_idx" ON "trip_budget_changes" USING btree ("trip_id","created_at");