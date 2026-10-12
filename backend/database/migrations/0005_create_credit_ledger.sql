CREATE TYPE "public"."credit_transaction_type" AS ENUM('signup_grant', 'generation_hold', 'generation_refund');--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" "credit_transaction_type" NOT NULL,
	"generation_id" uuid,
	"idempotency_key" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_transactions_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credit_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_transactions_user_id_created_at_idx" ON "credit_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "credit_transactions_generation_id_idx" ON "credit_transactions" USING btree ("generation_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_credit_balance_non_negative" CHECK ("users"."credit_balance" >= 0);--> statement-breakpoint
INSERT INTO "credit_transactions" ("user_id", "amount", "type", "idempotency_key") SELECT "id", 60, 'signup_grant', 'user:' || "id" || ':signup-grant' FROM "users";--> statement-breakpoint
UPDATE "users" SET "credit_balance" = 60;
