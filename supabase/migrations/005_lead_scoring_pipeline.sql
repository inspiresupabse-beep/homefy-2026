-- Lead scoring & pipeline stages (run in Supabase SQL Editor)
-- Step 1: adds temperature + probability. Step 2: migrates pipeline stages.

-- 1. Temperature & conversion probability
DO $$ BEGIN
  CREATE TYPE lead_temperature AS ENUM ('hot', 'warm', 'cold');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS temperature lead_temperature NOT NULL DEFAULT 'warm';

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS conversion_probability INTEGER NOT NULL DEFAULT 0;

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_conversion_probability_check;
ALTER TABLE leads ADD CONSTRAINT leads_conversion_probability_check
  CHECK (conversion_probability >= 0 AND conversion_probability <= 100);

-- 2. Migrate pipeline stages (old → new)
DO $$ BEGIN
  CREATE TYPE lead_status_new AS ENUM (
    'new_inquiry',
    'discovery',
    'qualified',
    'proposal_sent',
    'decision_pending',
    'converted'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'status'
      AND udt_name = 'lead_status'
  ) THEN
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS status_new lead_status_new;

    UPDATE leads SET status_new = CASE status::text
      WHEN 'new' THEN 'new_inquiry'::lead_status_new
      WHEN 'qualified' THEN 'qualified'::lead_status_new
      WHEN 'pending' THEN 'decision_pending'::lead_status_new
      WHEN 'converted' THEN 'converted'::lead_status_new
      ELSE 'new_inquiry'::lead_status_new
    END
    WHERE status_new IS NULL;

    ALTER TABLE leads ALTER COLUMN status_new SET DEFAULT 'new_inquiry';
    ALTER TABLE leads ALTER COLUMN status_new SET NOT NULL;
    ALTER TABLE leads DROP COLUMN status;
    ALTER TABLE leads RENAME COLUMN status_new TO status;
    DROP TYPE IF EXISTS lead_status;
    ALTER TYPE lead_status_new RENAME TO lead_status;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
