CREATE TABLE "message_mirrors" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_message_id" varchar(255) NOT NULL,
	"mirrored_message_id" varchar(255) NOT NULL,
	"original_channel_id" varchar(255) NOT NULL,
	"mirrored_channel_id" varchar(255) NOT NULL,
	"webhook_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_message_mirrors_original" ON "message_mirrors" USING btree ("original_message_id");--> statement-breakpoint
CREATE INDEX "idx_message_mirrors_mirrored" ON "message_mirrors" USING btree ("mirrored_message_id");