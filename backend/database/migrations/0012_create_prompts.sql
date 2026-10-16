CREATE TABLE "prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(120) NOT NULL,
	"text" text NOT NULL,
	"category" varchar(30) NOT NULL,
	"style" varchar(40),
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prompts_user_id_updated_at_idx" ON "prompts" USING btree ("user_id","updated_at");--> statement-breakpoint
INSERT INTO "platform_settings" ("key", "value") VALUES ('prompt_model', '"gpt-4.1-mini"'::jsonb) ON CONFLICT ("key") DO NOTHING;
