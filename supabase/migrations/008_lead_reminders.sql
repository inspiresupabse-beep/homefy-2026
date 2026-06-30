-- Lead follow-up reminders & in-app notifications

CREATE TABLE IF NOT EXISTS lead_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Follow up',
  message TEXT,
  remind_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  popup_shown_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_reminders_user_due ON lead_reminders(user_id, remind_at);
CREATE INDEX IF NOT EXISTS idx_lead_reminders_lead ON lead_reminders(lead_id);

ALTER TABLE lead_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reminders" ON lead_reminders
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users create reminders" ON lead_reminders
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users update own reminders" ON lead_reminders
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users delete own reminders" ON lead_reminders
  FOR DELETE TO authenticated USING (created_by = auth.uid() OR is_admin());

NOTIFY pgrst, 'reload schema';
