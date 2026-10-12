CREATE TYPE "public"."generation_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."generation_type" AS ENUM('text_to_image');--> statement-breakpoint
CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "generation_type" NOT NULL,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"prompt" text NOT NULL,
	"enhanced_prompt" text,
	"negative_prompt" text,
	"provider" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"image_count" integer DEFAULT 1 NOT NULL,
	"error_category" varchar(50),
	"error_message" varchar(500),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"generation_id" uuid,
	"storage_key" varchar(512) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "images_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generations_user_id_created_at_idx" ON "generations" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "generations_status_idx" ON "generations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "images_user_id_created_at_idx" ON "images" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "images_generation_id_idx" ON "images" USING btree ("generation_id");