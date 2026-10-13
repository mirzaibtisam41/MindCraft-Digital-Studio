CREATE TABLE "generation_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(60) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "generation_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ai_model_generation_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"generation_type_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"enabled_options" jsonb,
	"default_options" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_model_generation_types_model_type_unique" UNIQUE("model_id","generation_type_id")
);
--> statement-breakpoint
ALTER TABLE "ai_model_generation_types" ADD CONSTRAINT "ai_model_generation_types_model_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_generation_types" ADD CONSTRAINT "ai_model_generation_types_generation_type_fk" FOREIGN KEY ("generation_type_id") REFERENCES "public"."generation_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
INSERT INTO "generation_types" ("code", "name", "description") VALUES
  ('text_to_image', 'Text to Image', 'Create a new image from a text prompt.'),
  ('image_edit', 'Image Editing', 'Change parts of an existing image with an instruction.'),
  ('image_to_image', 'Image to Image', 'Create a new image based on an uploaded image and a prompt.');
