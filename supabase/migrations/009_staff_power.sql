-- Staff power / access level per user (set by admin)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS staff_power TEXT NOT NULL DEFAULT 'leads_and_orders';

UPDATE profiles SET staff_power = 'full_access' WHERE role = 'admin';

NOTIFY pgrst, 'reload schema';
