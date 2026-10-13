CREATE TYPE "public"."credit_transaction_type" AS ENUM('signup_grant', 'admin_credit', 'admin_debit', 'generation_hold', 'generation_refund');--> statement-breakpoint
CREATE TABLE "ai_model_credit_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_generation_type_id" uuid NOT NULL,
	"quality" varchar(30) NOT NULL,
	"credits_per_image" integer NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_model_credit_prices_workflow_quality_unique" UNIQUE("model_generation_type_id","quality"),
	CONSTRAINT "ai_model_credit_prices_credits_positive" CHECK ("ai_model_credit_prices"."credits_per_image" > 0)
);
--> statement-breakpoint
CREATE TABLE "credit_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_wallets_user_unique" UNIQUE("user_id"),
	CONSTRAINT "credit_wallets_balance_not_negative" CHECK ("credit_wallets"."balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"type" "credit_transaction_type" NOT NULL,
	"idempotency_key" varchar(200),
	"reason" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_transactions_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "credit_transactions_amount_not_zero" CHECK ("credit_transactions"."amount" <> 0),
	CONSTRAINT "credit_transactions_balance_after_not_negative" CHECK ("credit_transactions"."balance_after" >= 0)
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_model_credit_prices" ADD CONSTRAINT "ai_model_credit_prices_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_credit_prices" ADD CONSTRAINT "ai_model_credit_prices_workflow_fk" FOREIGN KEY ("model_generation_type_id") REFERENCES "public"."ai_model_generation_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_wallets" ADD CONSTRAINT "credit_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_wallet_id_credit_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."credit_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_transactions_wallet_id_idx" ON "credit_transactions" USING btree ("wallet_id","created_at");--> statement-breakpoint
INSERT INTO "platform_settings" ("key", "value") VALUES ('signup_credits', '60'::jsonb);--> statement-breakpoint
INSERT INTO "credit_wallets" ("user_id") SELECT "id" FROM "users";
