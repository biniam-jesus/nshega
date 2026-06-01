-- Shega Café ERP Supabase migration
-- Production-ready schema for restaurant operations, inventory, staff, finance, and analytics.

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- User profiles linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  avatar_url text,
  locale text NOT NULL DEFAULT 'en',
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_profiles_auth_users FOREIGN KEY (auth_uid) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Branch management for multi-location cafe support
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  address text,
  city text,
  state text,
  country text,
  phone text,
  manager_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Supplier Management
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  category text, -- e.g., 'Dairy', 'Bakery', 'Maintenance'
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Daily sales reconciliation
CREATE TABLE IF NOT EXISTS public.daily_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  date date NOT NULL,
  system_sales numeric(12,2) NOT NULL DEFAULT 0,
  actual_cash numeric(12,2) NOT NULL DEFAULT 0,
  difference numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Match',
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Expense management
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  category text NOT NULL,
  type text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  date date NOT NULL,
  note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employee records and staff roles
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  hired_date date,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Attendance tracking
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  check_in timestamptz,
  check_out timestamptz,
  date date NOT NULL,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Consumable inventory tracking
CREATE TABLE IF NOT EXISTS public.consumables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity int NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'unit',
  usage_rate text,
  restock_level int NOT NULL DEFAULT 0,
  supplier text,
  last_restocked_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Detailed Stock Logs (Tracking history of changes)
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  item_type text NOT NULL CHECK (item_type IN ('consumable', 'drink')),
  item_id uuid NOT NULL,
  change_amount int NOT NULL,
  reason text NOT NULL, -- e.g., 'restock', 'waste', 'sale', 'correction'
  previous_quantity int NOT NULL,
  new_quantity int NOT NULL,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Drinks inventory tracking
CREATE TABLE IF NOT EXISTS public.drinks_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  name text NOT NULL,
  size text,
  quantity int NOT NULL DEFAULT 0,
  sold_per_day int NOT NULL DEFAULT 0,
  supplier text,
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Asset registry for kitchen equipment and furniture
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  name text NOT NULL,
  serial_number text,
  category text,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  purchase_date date,
  warranty_until date,
  condition text,
  notes text,
  managed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Customer expense log
CREATE TABLE IF NOT EXISTS public.customer_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  customer_name text,
  reason text NOT NULL,
  order_reference text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  date date NOT NULL,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Maintenance records for repairs and service
CREATE TABLE IF NOT EXISTS public.maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  item text NOT NULL,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  technician text,
  maintenance_type text,
  status text NOT NULL DEFAULT 'open',
  date date NOT NULL,
  note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Upgrade projects and capital improvements
CREATE TABLE IF NOT EXISTS public.upgrades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  project_name text NOT NULL,
  category text,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  description text,
  status text NOT NULL DEFAULT 'planned',
  date date NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Purchase tracking (Record-keeping only)
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  cash_used numeric(12,2) NOT NULL DEFAULT 0, -- For tracking only, not deducted from P&L
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name text, -- Fallback text field
  payment_method text NOT NULL,
  purchase_date date NOT NULL,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notification inbox for admin/manager alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'system',
  priority text NOT NULL DEFAULT 'normal',
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log for all critical operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  table_name text NOT NULL,
  record_id text,
  operation text NOT NULL,
  changed_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helper functions
CREATE OR REPLACE FUNCTION public.fn_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Automatically set the creator profile on purchases
CREATE OR REPLACE FUNCTION public.fn_set_purchase_created_by()
RETURNS trigger AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    SELECT id INTO NEW.created_by FROM public.profiles WHERE auth_uid = auth.uid() LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatically update inventory quantities and logs when a purchase is recorded
CREATE OR REPLACE FUNCTION public.fn_update_inventory_from_purchase()
RETURNS trigger AS $$
DECLARE
  target_id uuid;
  prev_qty int;
BEGIN
  -- Handle Consumables
  IF NEW.category = 'consumable' THEN
    SELECT id, quantity INTO target_id, prev_qty FROM public.consumables 
    WHERE name = NEW.item_name AND branch_id = NEW.branch_id LIMIT 1;
    
    IF target_id IS NOT NULL THEN
      UPDATE public.consumables SET quantity = quantity + NEW.quantity, last_restocked_at = now() WHERE id = target_id;
      
      INSERT INTO public.inventory_logs(branch_id, item_type, item_id, change_amount, reason, previous_quantity, new_quantity, recorded_by)
      VALUES (NEW.branch_id, 'consumable', target_id, NEW.quantity, 'Purchase Entry: ' || NEW.item_name, prev_qty, prev_qty + NEW.quantity, NEW.created_by);
    END IF;
  
  -- Handle Drinks
  ELSIF NEW.category = 'drinks' THEN
    SELECT id, quantity INTO target_id, prev_qty FROM public.drinks_stock 
    WHERE name = NEW.item_name AND branch_id = NEW.branch_id LIMIT 1;

    IF target_id IS NOT NULL THEN
      UPDATE public.drinks_stock SET quantity = quantity + NEW.quantity, last_updated = now() WHERE id = target_id;
      
      INSERT INTO public.inventory_logs(branch_id, item_type, item_id, change_amount, reason, previous_quantity, new_quantity, recorded_by)
      VALUES (NEW.branch_id, 'drink', target_id, NEW.quantity, 'Purchase Entry: ' || NEW.item_name, prev_qty, prev_qty + NEW.quantity, NEW.created_by);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_daily_sales_calculate()
RETURNS trigger AS $$
BEGIN
  NEW.difference := NEW.actual_cash - NEW.system_sales;
  NEW.status := CASE
    WHEN NEW.difference = 0 THEN 'Match'
    WHEN NEW.difference < 0 THEN 'Shortage'
    ELSE 'Extra'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS trigger AS $$
DECLARE
  actor uuid;
  payload jsonb;
BEGIN
  SELECT id INTO actor FROM public.profiles WHERE auth_uid = auth.uid() LIMIT 1;

  IF TG_OP = 'DELETE' THEN
    payload := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSE
    payload := jsonb_build_object('new', to_jsonb(NEW));
  END IF;

  INSERT INTO public.audit_logs(table_name, record_id, operation, actor_id, changed_data, created_at)
  VALUES (TG_TABLE_NAME, COALESCE(COALESCE(NEW.id::text, OLD.id::text), ''), TG_OP, actor, payload, now());

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_create_profile_from_auth()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (auth_uid, full_name, email, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta->>'full_name', 'Shega Café User'), NEW.email, now(), now())
  ON CONFLICT (auth_uid) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_user() RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE auth_uid = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin() RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE auth_uid = auth.uid()
      AND role IN ('admin', 'manager')
  );
$$ LANGUAGE sql STABLE;

-- Updated P&L summary to be branch-aware
CREATE OR REPLACE FUNCTION public.fn_profit_loss_summary(p_branch_id uuid, start_date date, end_date date)
RETURNS TABLE(
  total_sales numeric,
  total_expenses numeric,
  total_customer_expenses numeric,
  total_upgrade_expenses numeric,
  total_maintenance_expenses numeric,
  net_profit numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(actual_cash) FROM public.daily_sales WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0),
    COALESCE((SELECT SUM(amount) FROM public.expenses WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0),
    COALESCE((SELECT SUM(amount) FROM public.customer_expenses WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0),
    COALESCE((SELECT SUM(cost) FROM public.upgrades WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0),
    COALESCE((SELECT SUM(cost) FROM public.maintenance WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0),
    COALESCE((SELECT SUM(actual_cash) FROM public.daily_sales WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0)
      - (
        COALESCE((SELECT SUM(amount) FROM public.expenses WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0)
        + COALESCE((SELECT SUM(amount) FROM public.customer_expenses WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0)
        + COALESCE((SELECT SUM(cost) FROM public.upgrades WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0)
        + COALESCE((SELECT SUM(cost) FROM public.maintenance WHERE branch_id = p_branch_id AND date BETWEEN start_date AND end_date), 0)
      );
END;
$$ LANGUAGE plpgsql STABLE;

-- Triggers for automated updates and calculations
CREATE TRIGGER trg_set_timestamp_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_daily_sales_calculate
BEFORE INSERT OR UPDATE ON public.daily_sales
FOR EACH ROW EXECUTE FUNCTION public.fn_daily_sales_calculate();

CREATE TRIGGER trg_set_timestamp_daily_sales
BEFORE UPDATE ON public.daily_sales
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_daily_sales
AFTER INSERT OR UPDATE OR DELETE ON public.daily_sales
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_expenses
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_expenses
AFTER INSERT OR UPDATE OR DELETE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_employees
BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_employees
AFTER INSERT OR UPDATE OR DELETE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_attendance
BEFORE UPDATE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_attendance
AFTER INSERT OR UPDATE OR DELETE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_consumables
BEFORE UPDATE ON public.consumables
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_consumables
AFTER INSERT OR UPDATE OR DELETE ON public.consumables
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_drinks_stock
BEFORE UPDATE ON public.drinks_stock
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_drinks_stock
AFTER INSERT OR UPDATE OR DELETE ON public.drinks_stock
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_assets
BEFORE UPDATE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_assets
AFTER INSERT OR UPDATE OR DELETE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_customer_expenses
BEFORE UPDATE ON public.customer_expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_customer_expenses
AFTER INSERT OR UPDATE OR DELETE ON public.customer_expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_maintenance
BEFORE UPDATE ON public.maintenance
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_maintenance
AFTER INSERT OR UPDATE OR DELETE ON public.maintenance
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_set_timestamp_upgrades
BEFORE UPDATE ON public.upgrades
FOR EACH ROW EXECUTE FUNCTION public.fn_set_timestamp();

CREATE TRIGGER trg_audit_upgrades
AFTER INSERT OR UPDATE OR DELETE ON public.upgrades
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_notifications
AFTER INSERT OR UPDATE OR DELETE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- Auth user hook to create a profile automatically
CREATE TRIGGER trg_create_profile_from_auth
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.fn_create_profile_from_auth();

CREATE TRIGGER trg_set_purchase_created_by
BEFORE INSERT ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_set_purchase_created_by();

CREATE TRIGGER trg_update_inventory_on_purchase
AFTER INSERT ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_update_inventory_from_purchase();

-- Enable Row Level Security on the core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY IF NOT EXISTS "Admins can manage profiles" ON public.profiles
  FOR ALL
  USING (auth.role() = 'authenticated' AND public.is_admin_user())
  WITH CHECK (auth.role() = 'authenticated' AND public.is_admin_user());

CREATE POLICY IF NOT EXISTS "Users can read own profile" ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated' AND auth.uid() = auth_uid);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid() = auth_uid)
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = auth_uid);

CREATE POLICY IF NOT EXISTS "Users can insert profile for own auth" ON public.profiles
  FOR INSERT
  USING (auth.role() = 'authenticated' AND auth.uid() = auth_uid)
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = auth_uid);

-- Policies for operational tables
DO $$
BEGIN
  FOR table_name IN ARRAY[
    'branches',
    'daily_sales',
    'expenses',
    'employees',
    'attendance',
    'consumables',
    'drinks_stock',
    'assets',
    'customer_expenses',
    'maintenance',
    'upgrades',
    'purchases',
    'suppliers',
    'inventory_logs'
  ] LOOP
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Managers and admins can select %s" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'' AND public.is_manager_or_admin())', table_name, table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Managers and admins can insert %s" ON public.%I FOR INSERT USING (auth.role() = ''authenticated'' AND public.is_manager_or_admin()) WITH CHECK (auth.role() = ''authenticated'' AND public.is_manager_or_admin())', table_name, table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Managers and admins can update %s" ON public.%I FOR UPDATE USING (auth.role() = ''authenticated'' AND public.is_manager_or_admin()) WITH CHECK (auth.role() = ''authenticated'' AND public.is_manager_or_admin())', table_name, table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Managers and admins can delete %s" ON public.%I FOR DELETE USING (auth.role() = ''authenticated'' AND public.is_manager_or_admin())', table_name, table_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Notifications policies
CREATE POLICY IF NOT EXISTS "Recipients can read notifications" ON public.notifications
  FOR SELECT
  USING (auth.role() = 'authenticated' AND (public.is_manager_or_admin() OR recipient_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid())));

CREATE POLICY IF NOT EXISTS "Admins can insert notifications" ON public.notifications
  FOR INSERT
  USING (auth.role() = 'authenticated' AND public.is_manager_or_admin())
  WITH CHECK (auth.role() = 'authenticated' AND public.is_manager_or_admin());

CREATE POLICY IF NOT EXISTS "Recipients can update own notification status" ON public.notifications
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND recipient_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()))
  WITH CHECK (auth.role() = 'authenticated' AND recipient_id = (SELECT id FROM public.profiles WHERE auth_uid = auth.uid()));

CREATE POLICY IF NOT EXISTS "Admins can delete notifications" ON public.notifications
  FOR DELETE
  USING (auth.role() = 'authenticated' AND public.is_manager_or_admin());

-- Audit logs are admin-only
CREATE POLICY IF NOT EXISTS "Admins can read audit logs" ON public.audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin_user());

CREATE POLICY IF NOT EXISTS "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT
  USING (auth.role() = 'authenticated' AND public.is_admin_user())
  WITH CHECK (auth.role() = 'authenticated' AND public.is_admin_user());

-- Indexes for performance and analytics
CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid ON public.profiles(auth_uid);
CREATE INDEX IF NOT EXISTS idx_branches_code ON public.branches(code);
CREATE INDEX IF NOT EXISTS idx_branches_active ON public.branches(active);
CREATE INDEX IF NOT EXISTS idx_daily_sales_branch_date ON public.daily_sales(branch_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_sales_status ON public.daily_sales(status);
CREATE INDEX IF NOT EXISTS idx_expenses_branch_date ON public.expenses(branch_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_employees_branch_role ON public.employees(branch_id, role);
CREATE INDEX IF NOT EXISTS idx_attendance_branch_employee_date ON public.attendance(branch_id, employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_consumables_branch_quantity ON public.consumables(branch_id, quantity);
CREATE INDEX IF NOT EXISTS idx_drinks_stock_branch_quantity ON public.drinks_stock(branch_id, quantity);
CREATE INDEX IF NOT EXISTS idx_assets_branch_category ON public.assets(branch_id, category);
CREATE INDEX IF NOT EXISTS idx_customer_expenses_branch_date ON public.customer_expenses(branch_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_branch_date ON public.maintenance(branch_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_upgrades_branch_date ON public.upgrades(branch_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_branch_date ON public.purchases(branch_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, read_at);

-- Sample seed data for Shega Café operations
INSERT INTO public.branches (name, code, address, city, state, country, phone, active, notes)
VALUES
  ('Shega Café Main Branch', 'MAIN', '12 Bole Road', 'Addis Ababa', 'Addis Ababa', 'Ethiopia', '+251912000000', true, 'Headquarter location for Shega Café'),
  ('Shega Café East Branch', 'EAST', '45 Megenagna Avenue', 'Addis Ababa', 'Addis Ababa', 'Ethiopia', '+251912000001', true, 'East side cafe service branch');

INSERT INTO public.daily_sales (branch_id, date, system_sales, actual_cash, notes)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), '2026-05-26', 720.00, 720.00, 'Breakfast service'),
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), '2026-05-27', 860.00, 858.50, 'Lunch rush reconciled'),
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), '2026-05-28', 940.00, 955.25, 'Dinner service overage');

INSERT INTO public.expenses (branch_id, category, type, amount, date, note)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Utilities', 'Monthly Fixed', 210.00, '2026-05-01', 'Electricity and water'),
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Supplies', 'Variable', 135.25, '2026-05-15', 'Coffee beans and paper cups'),
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Maintenance', 'Variable', 95.00, '2026-05-20', 'Espresso machine tune-up');

INSERT INTO public.employees (branch_id, name, phone, role, status, hired_date)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Martha Kebede', '+251911000111', 'Manager', 'active', '2024-09-01'),
  ((SELECT id FROM public.branches WHERE code = 'EAST'), 'Samuel Asefa', '+251911000222', 'Barista', 'active', '2025-02-14');

INSERT INTO public.attendance (branch_id, employee_id, check_in, check_out, date)
SELECT branch_id, id, '2026-05-28T08:00:00Z', '2026-05-28T16:00:00Z', '2026-05-28' FROM public.employees WHERE name = 'Martha Kebede';

INSERT INTO public.consumables (branch_id, name, quantity, unit, usage_rate, restock_level, supplier)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Coffee beans', 32, 'kg', '8kg/week', 10, 'Blue Mountain Suppliers'),
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Milk', 45, 'liters', '12L/week', 20, 'Local Dairy Co.');

INSERT INTO public.drinks_stock (branch_id, name, size, quantity, sold_per_day, supplier)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Espresso', 'Single', 120, 42, 'Roaster House'),
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Iced Latte', 'Medium', 80, 18, 'Roaster House');

INSERT INTO public.assets (branch_id, name, serial_number, category, cost, purchase_date, condition, warranty_until)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Espresso Machine', 'SC-2001', 'Kitchen', 5400.00, '2024-08-10', 'Good', '2027-08-10'),
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'POS Terminal', 'POS-11', 'Operations', 1200.00, '2025-01-12', 'Good', '2028-01-12');

INSERT INTO public.customer_expenses (branch_id, customer_name, reason, order_reference, amount, date)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Lakeview Catering', 'Private event refund', 'ORD-20260522', 85.00, '2026-05-22');

INSERT INTO public.maintenance (branch_id, item, cost, technician, maintenance_type, date, note)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Refrigerator', 170.00, 'Tesfaye Repair Co.', 'Preventive', '2026-05-18', 'Quarterly check and cleaning');

INSERT INTO public.upgrades (branch_id, project_name, category, cost, description, status, date)
VALUES
  ((SELECT id FROM public.branches WHERE code = 'MAIN'), 'Menu tablet ordering', 'POS', 960.00, 'Smart table tablets for quick cafe ordering', 'planned', '2026-06-12');

INSERT INTO public.notifications (recipient_id, title, message, category, priority)
VALUES
  ((SELECT id FROM public.profiles LIMIT 1), 'Welcome to Shega Café', 'Your restaurant ERP workspace is ready. Review today’s sales and inventory status.', 'system', 'high');

-- Notes:
-- 1) After creating your first Supabase Auth user, add a corresponding row in public.profiles with auth_uid = auth.uid().
-- 2) Grant that user role = 'admin' so administrative RLS policies apply.
-- 3) The schema supports realtime updates through Supabase Realtime on all core tables.
