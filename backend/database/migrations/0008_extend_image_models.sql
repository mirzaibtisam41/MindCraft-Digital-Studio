ALTER TABLE "generations" ADD COLUMN "provider_cost_usd" numeric(12, 6);--> statement-breakpoint
ALTER TABLE "image_models" ADD COLUMN "description" varchar(200) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "image_models" ADD COLUMN "badge" varchar(30);--> statement-breakpoint
ALTER TABLE "image_models" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "image_models" ADD COLUMN "tools" jsonb DEFAULT '["text_to_image"]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "image_models" ADD COLUMN "provider_cost_per_image" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "image_models_single_default_idx" ON "image_models" USING btree ("is_default") WHERE "image_models"."is_default";--> statement-breakpoint
UPDATE "image_models" SET "is_default" = true
WHERE "id" = (SELECT "id" FROM "image_models" WHERE "enabled" ORDER BY "sort_order", "id" LIMIT 1);
