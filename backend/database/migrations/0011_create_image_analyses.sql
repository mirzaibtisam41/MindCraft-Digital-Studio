CREATE TYPE "public"."image_analysis_task" AS ENUM('describe', 'question', 'ocr', 'objects', 'design', 'caption');--> statement-breakpoint
ALTER TYPE "public"."credit_transaction_type" ADD VALUE 'analysis_charge';--> statement-breakpoint
ALTER TYPE "public"."credit_transaction_type" ADD VALUE 'analysis_refund';--> statement-breakpoint
CREATE TABLE "image_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"image_id" uuid NOT NULL,
	"task" "image_analysis_task" NOT NULL,
	"question" text,
	"result" jsonb,
	"status" "generation_status" NOT NULL,
	"credits" integer NOT NULL,
	"model" varchar(100) NOT NULL,
	"error_category" "provider_error_category",
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "image_analyses_credits_not_negative" CHECK ("image_analyses"."credits" >= 0)
);
--> statement-breakpoint
ALTER TABLE "image_analyses" ADD CONSTRAINT "image_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_analyses" ADD CONSTRAINT "image_analyses_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "image_analyses_image_id_created_at_idx" ON "image_analyses" USING btree ("image_id","created_at");--> statement-breakpoint
CREATE INDEX "image_analyses_status_created_at_idx" ON "image_analyses" USING btree ("status","created_at");--> statement-breakpoint
INSERT INTO "platform_settings" ("key", "value") VALUES ('vision_model', '"gpt-4.1-mini"'::jsonb), ('vision_credits', '1'::jsonb) ON CONFLICT ("key") DO NOTHING;
