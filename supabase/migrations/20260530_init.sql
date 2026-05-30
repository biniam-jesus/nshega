-- Supabase Studio migration for Daily Business Control System

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin user table used for RLS admin authorization check
CREATE TABLE IF NOT EXISTS public.admin_users (
  auth_uid uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Daily sales tracker
CREATE TABLE IF NOT EXISTS public.daily_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  system_sales numeric(12,2) NOT NULL DEFAULT 0,
  actual_cash numeric(12,2) NOT NULL DEFAULT 0,
  difference numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Match',
  created_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TRIGGER trg_daily_sales_calculate
BEFORE INSERT OR UPDATE ON public.daily_sales
FOR EACH ROW EXECUTE FUNCTION public.fn_daily_sales_calculate();

-- Expense management
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  type text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Staff management
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  check_in timestamptz,
  check_out timestamptz,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Non-consumable inventory
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  purchase_date date,
  condition text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Consumable inventory
CREATE TABLE IF NOT EXISTS public.consumables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity int NOT NULL DEFAULT 0,
  usage_rate text,
  restock_level int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Drinks and water stock
CREATE TABLE IF NOT EXISTS public.drinks_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity int NOT NULL DEFAULT 0,
  sold_per_day int NOT NULL DEFAULT 0,
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Customer-related expenses
CREATE TABLE IF NOT EXISTS public.customer_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reason text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  order_reference text,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Upgrade costs
CREATE TABLE IF NOT EXISTS public.upgrades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  description text,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Maintenance expenses
CREATE TABLE IF NOT EXISTS public.maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item text NOT NULL,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  technician text,
  date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security for all tables used by the app
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

-- Admin authorization helper
CREATE OR REPLACE FUNCTION public.is_admin_user() RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users WHERE auth_uid = auth.uid()
  );
$$ LANGUAGE sql STABLE;

-- Admin table policies
CREATE POLICY "Admins can manage admin_users" ON public.admin_users
  USING (auth.role() = 'authenticated' AND public.is_admin_user())
  WITH CHECK (auth.role() = 'authenticated' AND public.is_admin_user());

-- Policies for application tables
DO $$
BEGIN
  FOR table_name IN ARRAY[
    'daily_sales',
    'expenses',
    'employees',
    'attendance',
    'assets',
    'consumables',
    'drinks_stock',
    'customer_expenses',
    'upgrades',
    'maintenance'
  ] LOOP
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Authenticated admins can read %s" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'' AND public.is_admin_user())', table_name, table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Authenticated admins can insert %s" ON public.%I FOR INSERT USING (auth.role() = ''authenticated'' AND public.is_admin_user()) WITH CHECK (auth.role() = ''authenticated'' AND public.is_admin_user())', table_name, table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Authenticated admins can update %s" ON public.%I FOR UPDATE USING (auth.role() = ''authenticated'' AND public.is_admin_user()) WITH CHECK (auth.role() = ''authenticated'' AND public.is_admin_user())', table_name, table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Authenticated admins can delete %s" ON public.%I FOR DELETE USING (auth.role() = ''authenticated'' AND public.is_admin_user())', table_name, table_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Seed instructions:
-- 1) Create a Supabase user via auth.
-- 2) Add their auth.uid() entry to public.admin_users using the service role or SQL editor.
-- 3) Use the app with only authenticated users who are listed in admin_users.
