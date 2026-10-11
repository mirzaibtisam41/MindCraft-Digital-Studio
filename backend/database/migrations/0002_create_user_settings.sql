CREATE TYPE "public"."theme" AS ENUM('dark', 'light', 'system');--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"default_model" varchar(100),
	"default_aspect_ratio" varchar(16) DEFAULT '1:1' NOT NULL,
	"auto_enhance_prompts" boolean DEFAULT false NOT NULL,
	"save_originals_with_edits" boolean DEFAULT true NOT NULL,
	"notify_generation_complete" boolean DEFAULT true NOT NULL,
	"notify_generation_failed" boolean DEFAULT true NOT NULL,
	"notify_low_credits" boolean DEFAULT true NOT NULL,
	"notify_product_updates" boolean DEFAULT false NOT NULL,
	"theme" "theme" DEFAULT 'dark' NOT NULL,
	"reduce_motion" boolean DEFAULT false NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;