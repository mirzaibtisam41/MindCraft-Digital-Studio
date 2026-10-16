ALTER TYPE "public"."auth_token_type" ADD VALUE 'email_change';--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD COLUMN "new_email" varchar(255);