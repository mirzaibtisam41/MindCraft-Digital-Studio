CREATE TYPE "public"."image_source" AS ENUM('upload', 'generated', 'edited');--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source" "image_source" NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"size_bytes" integer NOT NULL,
	"original_file_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "images_storage_key_unique" UNIQUE("storage_key"),
	CONSTRAINT "images_dimensions_positive" CHECK ("images"."width" > 0 AND "images"."height" > 0),
	CONSTRAINT "images_size_bytes_positive" CHECK ("images"."size_bytes" > 0)
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "images_user_id_created_at_idx" ON "images" USING btree ("user_id","created_at");