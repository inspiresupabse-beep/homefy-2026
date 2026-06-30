-- Homefy CRM - Initial Schema

CREATE TYPE user_role AS ENUM (
  'admin',
  'sales_agent',
  'sales_manager',
  'sales_executive',
  'leading_staff'
);
CREATE TYPE lead_temperature AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE lead_status AS ENUM (
  'new_inquiry',
  'discovery',
  'qualified',
  'proposal_sent',
  'decision_pending',
  'converted'
);
CREATE TYPE interaction_type AS ENUM ('site', 'shop', 'phone', 'online');
CREATE TYPE visit_status AS ENUM ('pending', 'scheduled', 'completed', 'cancelled', 'not_applicable');
CREATE TYPE order_status AS ENUM ('pending', 'in_production', 'ready', 'delivered', 'cancelled');
CREATE TYPE reminder_type AS ENUM ('10_days', '5_days');
CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'sales_executive',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  status lead_status NOT NULL DEFAULT 'new_inquiry',
  temperature lead_temperature NOT NULL DEFAULT 'warm',
  conversion_probability INTEGER NOT NULL DEFAULT 0 CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  interaction_type interaction_type NOT NULL DEFAULT 'phone',
  visit_status visit_status NOT NULL DEFAULT 'not_applicable',
  site_visit_date DATE,
  assigned_staff UUID REFERENCES profiles(id) ON DELETE SET NULL,
  narration TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  source TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  product_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  advance_payment NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance NUMERIC(12, 2) GENERATED ALWAYS AS (total - advance_payment) STORED,
  delivery_date DATE,
  status order_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_staff UUID REFERENCES profiles(id) ON DELETE SET NULL,
  narration TEXT,
  site_visit_date DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  transport_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  company_share NUMERIC(12, 2) NOT NULL DEFAULT 0,
  customer_share NUMERIC(12, 2) NOT NULL DEFAULT 0,
  vehicle_number TEXT,
  driver_name TEXT,
  dispatch_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT transport_split_valid CHECK (company_share + customer_share = transport_cost)
);

CREATE TABLE delivery_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reminder_type reminder_type NOT NULL,
  scheduled_for DATE NOT NULL,
  sent_at TIMESTAMPTZ,
  status reminder_status NOT NULL DEFAULT 'pending',
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, reminder_type)
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_temperature ON leads(temperature);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX idx_delivery_reminders_scheduled ON delivery_reminders(scheduled_for, status);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER logistics_updated_at BEFORE UPDATE ON logistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'HF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER orders_generate_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'sales_executive')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

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

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION schedule_delivery_reminders()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.delivery_date IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.delivery_date IS DISTINCT FROM NEW.delivery_date) THEN
    DELETE FROM delivery_reminders WHERE order_id = NEW.id;

    INSERT INTO delivery_reminders (order_id, reminder_type, scheduled_for, phone, message)
    VALUES
      (
        NEW.id,
        '10_days',
        NEW.delivery_date - INTERVAL '10 days',
        NEW.phone,
        'Hi ' || NEW.customer_name || ', this is Homefy. Your furniture delivery is scheduled in 10 days on ' ||
        TO_CHAR(NEW.delivery_date, 'Mon DD, YYYY') || '. Order: ' || NEW.order_number || '. Balance due: ₹' || (NEW.total - NEW.advance_payment)
      ),
      (
        NEW.id,
        '5_days',
        NEW.delivery_date - INTERVAL '5 days',
        NEW.phone,
        'Hi ' || NEW.customer_name || ', reminder from Homefy — your delivery is in 5 days on ' ||
        TO_CHAR(NEW.delivery_date, 'Mon DD, YYYY') || '. Order: ' || NEW.order_number || '. Balance due: ₹' || (NEW.total - NEW.advance_payment)
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_schedule_reminders
  AFTER INSERT OR UPDATE OF delivery_date, customer_name, phone, total, advance_payment ON orders
  FOR EACH ROW EXECUTE FUNCTION schedule_delivery_reminders();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update any lead" ON leads FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Agents can update assigned leads" ON leads FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());
CREATE POLICY "Admins can delete leads" ON leads FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Authenticated users can view orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update any order" ON orders FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Agents can update assigned orders" ON orders FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Authenticated users can view logistics" ON logistics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage logistics" ON logistics FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view reminders" ON delivery_reminders FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Service role manages reminders" ON delivery_reminders FOR ALL TO service_role USING (true) WITH CHECK (true);
