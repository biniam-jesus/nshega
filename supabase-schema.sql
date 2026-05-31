-- Supabase SQL schema for Daily Business Control System

-- Required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin table to restrict access to approved authenticated users only
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

-- Non-consumable assets
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

-- Upgrading expenses
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

-- Enable Row Level Security on all app tables
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

-- Policy helper function for admin-only access
CREATE OR REPLACE FUNCTION public.is_admin_user() RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.admin_users
    WHERE auth_uid = auth.uid()
  );
$$ LANGUAGE sql STABLE;

-- Admin_users policies
CREATE POLICY "Admins can manage admin_users" ON public.admin_users
  USING (auth.role() = 'authenticated' AND public.is_admin_user())
  WITH CHECK (auth.role() = 'authenticated' AND public.is_admin_user());

-- Policies for app data tables
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
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Authenticated admins can modify %s" ON public.%I FOR INSERT USING (auth.role() = ''authenticated'' AND public.is_admin_user()) WITH CHECK (auth.role() = ''authenticated'' AND public.is_admin_user())', table_name, table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Authenticated admins can update %s" ON public.%I FOR UPDATE USING (auth.role() = ''authenticated'' AND public.is_admin_user()) WITH CHECK (auth.role() = ''authenticated'' AND public.is_admin_user())', table_name, table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS "Authenticated admins can delete %s" ON public.%I FOR DELETE USING (auth.role() = ''authenticated'' AND public.is_admin_user())', table_name, table_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Notes:
-- 1) Seed public.admin_users manually using the Supabase service role or SQL editor after creating a user.
-- 2) The app assumes an authenticated admin session to access dashboard tables.
-- 3) If you want, I can also create a migration-friendly version for Supabase Studio.


-- Purchases / Shopping tracking
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) NOT NULL DEFAULT 0,
  cash_used numeric(12,2) NOT NULL DEFAULT 0,
  supplier_name text NOT NULL,
  payment_method text NOT NULL,
  purchase_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchases (admin only)
CREATE POLICY "Authenticated admins can read purchases" ON public.purchases
  FOR SELECT USING (auth.role() = 'authenticated' AND public.is_admin_user());

CREATE POLICY "Authenticated admins can insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND public.is_admin_user());

CREATE POLICY "Authenticated admins can update purchases" ON public.purchases
  FOR UPDATE USING (auth.role() = 'authenticated' AND public.is_admin_user());

CREATE POLICY "Authenticated admins can delete purchases" ON public.purchases
  FOR DELETE USING (auth.role() = 'authenticated' AND public.is_admin_user());
