-- STEP 2 of 2 — Run AFTER 004_step1_enum.sql has succeeded

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'sales_executive';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role := 'sales_agent';
  role_text text := NEW.raw_user_meta_data->>'role';
BEGIN
  IF role_text IS NOT NULL AND role_text <> '' THEN
    BEGIN
      assigned_role := role_text::user_role;
    EXCEPTION WHEN OTHERS THEN
      assigned_role := 'sales_agent';
    END;
  END IF;

  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN (
        'sales_agent',
        'sales_manager',
        'sales_executive',
        'leading_staff'
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
