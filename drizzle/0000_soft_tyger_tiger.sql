CREATE TABLE "chat_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"discord_user_id" varchar(255) NOT NULL,
	"discord_username" varchar(255) NOT NULL,
	"channel_type" varchar(10) NOT NULL,
	"original_message" text NOT NULL,
	"translated_message" text,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_chat_logs_created_at" ON "chat_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_chat_logs_channel_type" ON "chat_logs" USING btree ("channel_type");--> statement-breakpoint
CREATE INDEX "idx_chat_logs_user_id" ON "chat_logs" USING btree ("discord_user_id");