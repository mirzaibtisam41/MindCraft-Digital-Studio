ALTER TABLE "images" ADD COLUMN "thumbnail_key" varchar(512);--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "is_favorite" boolean DEFAULT false NOT NULL;