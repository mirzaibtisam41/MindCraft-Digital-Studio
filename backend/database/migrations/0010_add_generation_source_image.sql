ALTER TABLE "generations" ADD COLUMN "source_image_id" uuid;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_source_image_id_images_id_fk" FOREIGN KEY ("source_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generations_source_image_id_idx" ON "generations" USING btree ("source_image_id");