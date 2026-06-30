-- Homefy: upgrade leads schema (run once in Supabase SQL Editor)
-- Safe to re-run — uses IF NOT EXISTS / duplicate_object guards

-- Temperature & probability
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

-- Interaction & visit fields
DO $$ BEGIN
  CREATE TYPE interaction_type AS ENUM ('site', 'shop', 'phone', 'online');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('pending', 'scheduled', 'completed', 'cancelled', 'not_applicable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS interaction_type interaction_type NOT NULL DEFAULT 'phone',
  ADD COLUMN IF NOT EXISTS visit_status visit_status NOT NULL DEFAULT 'not_applicable',
  ADD COLUMN IF NOT EXISTS site_visit_date DATE,
  ADD COLUMN IF NOT EXISTS assigned_staff UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS narration TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS narration TEXT,
  ADD COLUMN IF NOT EXISTS site_visit_date DATE,
  ADD COLUMN IF NOT EXISTS assigned_staff UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Pipeline stage migration (old: new/qualified/pending/converted → new 6-stage enum)
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
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'status'
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
CREATE INDEX IF NOT EXISTS idx_leads_assigned_staff ON leads(assigned_staff);
CREATE INDEX IF NOT EXISTS idx_leads_interaction ON leads(interaction_type);
CREATE INDEX IF NOT EXISTS idx_leads_visit_status ON leads(visit_status);

-- Convert lead → order (copies narration, visit date, assigned staff)
CREATE OR REPLACE FUNCTION convert_lead_to_order(p_lead_id UUID, p_created_by UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_order_id UUID;
BEGIN
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  IF v_lead.status = 'converted' THEN
    RAISE EXCEPTION 'Lead is already converted';
  END IF;

  IF v_lead.interaction_type IN ('site', 'shop') AND v_lead.visit_status <> 'completed' THEN
    RAISE EXCEPTION 'Visit status must be Completed before converting Site or Shop leads';
  END IF;

  INSERT INTO orders (
    lead_id,
    customer_name,
    phone,
    assigned_to,
    assigned_staff,
    narration,
    site_visit_date,
    created_by,
    order_number
  ) VALUES (
    v_lead.id,
    v_lead.customer_name,
    v_lead.phone,
    COALESCE(v_lead.assigned_staff, v_lead.assigned_to),
    v_lead.assigned_staff,
    v_lead.narration,
    v_lead.site_visit_date,
    p_created_by,
    ''
  )
  RETURNING id INTO v_order_id;

  UPDATE leads
  SET status = 'converted', updated_at = NOW()
  WHERE id = p_lead_id;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION convert_lead_to_order(UUID, UUID) TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
