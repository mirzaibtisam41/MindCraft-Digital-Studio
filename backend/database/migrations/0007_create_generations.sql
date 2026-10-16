CREATE TYPE "public"."generation_status" AS ENUM('processing', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."provider_error_category" AS ENUM('safety_rejected', 'invalid_request', 'rate_limited', 'quota_exceeded', 'provider_auth_failed', 'provider_unavailable', 'timeout', 'unknown');--> statement-breakpoint
CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"model_workflow_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"status" "generation_status" NOT NULL,
	"credits_per_image" integer NOT NULL,
	"total_credits" integer NOT NULL,
	"error_category" "provider_error_category",
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "generations_credits_positive" CHECK ("generations"."credits_per_image" > 0 AND "generations"."total_credits" > 0)
);
--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "generation_id" uuid;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_model_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_model_workflow_fk" FOREIGN KEY ("model_workflow_id") REFERENCES "public"."model_workflows"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generations_user_id_created_at_idx" ON "generations" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "images_generation_id_idx" ON "images" USING btree ("generation_id");