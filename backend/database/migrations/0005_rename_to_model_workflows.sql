ALTER TABLE "ai_model_generation_types" RENAME TO "model_workflows";--> statement-breakpoint
DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'model_workflows'::regclass
      AND conname LIKE 'ai_model_generation_types%'
  LOOP
    EXECUTE format(
      'ALTER TABLE model_workflows RENAME CONSTRAINT %I TO %I',
      item.conname,
      replace(item.conname, 'ai_model_generation_types', 'model_workflows')
    );
  END LOOP;
END $$;--> statement-breakpoint
ALTER TABLE "ai_model_credit_prices" RENAME COLUMN "model_generation_type_id" TO "model_workflow_id";--> statement-breakpoint
DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'ai_model_credit_prices'::regclass
      AND conname LIKE '%model_generation_type_id%'
  LOOP
    EXECUTE format(
      'ALTER TABLE ai_model_credit_prices RENAME CONSTRAINT %I TO %I',
      item.conname,
      replace(item.conname, 'model_generation_type_id', 'model_workflow_id')
    );
  END LOOP;
END $$;
