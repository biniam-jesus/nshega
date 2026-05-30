'use client';

import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}

const navItems = [
  { id: 'overview', label: 'Dashboard', href: '/', icon: '📊' },
  { id: 'sales', label: 'Daily Sales', href: '/sales', icon: '💵' },
  { id: 'expenses', label: 'Expenses', href: '/expenses', icon: '🧾' },
  { id: 'profit-loss', label: 'Profit & Loss', href: '/profit-loss', icon: '📈' },
  { id: 'operations', label: 'Operations', href: '/operations', icon: '⚙️' },
  { id: 'staff', label: 'Staff Management', href: '/staff', icon: '👥' },
  { id: 'attendance', label: 'Attendance', href: '/attendance', icon: '⏱️' },
  { id: 'inventory', label: 'Consumable Inventory', href: '/inventory', icon: '🥖' },
  { id: 'drinks', label: 'Drinks Inventory', href: '/drinks-inventory', icon: '🥤' },
  { id: 'assets', label: 'Assets', href: '/assets', icon: '🏷️' },
  { id: 'maintenance', label: 'Maintenance', href: '/maintenance', icon: '🔧' },
  { id: 'upgrades', label: 'Upgrades', href: '/upgrades', icon: '🚀' },
  { id: 'reports', label: 'Reports', href: '/reports', icon: '🗂️' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function DashboardProvider({ activeTab, children }: { activeTab: string; children: ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [customerExp, setCustomerExp] = useState<any[]>([]);
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [salesInput, setSalesInput] = useState({ date: '', system_sales: '', actual_cash: '' });
  const [expenseInput, setExpenseInput] = useState({ category: '', type: 'Monthly Fixed', amount: '', date: '', note: '' });
  const [employeeInput, setEmployeeInput] = useState({ name: '', phone: '', role: '' });
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;
    fetchAllData();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [session, supabase]);

  const fetchAllData = async () => {
    if (!supabase) return;
    const s = await supabase.from('daily_sales').select('*').order('date', { ascending: false });
    const e = await supabase.from('expenses').select('*').order('date', { ascending: false });
    const emp = await supabase.from('employees').select('*');
    const att = await supabase.from('attendance').select('*, employees(name)').order('date', { ascending: false });
    const ast = await supabase.from('assets').select('*');
    const con = await supabase.from('consumables').select('*');
    const drk = await supabase.from('drinks_stock').select('*');
    const cust = await supabase.from('customer_expenses').select('*');
    const upg = await supabase.from('upgrades').select('*');
    const maint = await supabase.from('maintenance').select('*');

    if (s.data) setSales(s.data);
    if (e.data) setExpenses(e.data);
    if (emp.data) setEmployees(emp.data);
    if (att.data) setAttendance(att.data);
    if (ast.data) setAssets(ast.data);
    if (con.data) setConsumables(con.data);
    if (drk.data) setDrinks(drk.data);
    if (cust.data) setCustomerExp(cust.data);
    if (upg.data) setUpgrades(upg.data);
    if (maint.data) setMaintenance(maint.data);
  };

  const setupRealtimeSubscriptions = () => {
    if (!supabase) return;
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  };

  const getSaleDifference = (sale: any) => {
    const system = Number(sale.system_sales) || 0;
    const actual = Number(sale.actual_cash) || 0;
    return Number((actual - system).toFixed(2));
  };

  const getSaleStatus = (sale: any) => {
    const diff = getSaleDifference(sale);
    if (diff === 0) return 'Match';
    if (diff < 0) return 'Shortage';
    return 'Extra';
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const handleAddSales = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const systemSales = parseFloat(salesInput.system_sales);
    const actualCash = parseFloat(salesInput.actual_cash);
    const difference = Number((actualCash - systemSales).toFixed(2));
    const status = difference === 0 ? 'Match' : difference < 0 ? 'Shortage' : 'Extra';

    const { error } = await supabase.from('daily_sales').insert([
      {
        date: salesInput.date,
        system_sales: systemSales,
        actual_cash: actualCash,
        difference,
        status,
      }
    ]);
    if (error) alert(error.message);
    else setSalesInput({ date: '', system_sales: '', actual_cash: '' });
  };

  const handleAddExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from('expenses').insert([
      { ...expenseInput, amount: parseFloat(expenseInput.amount) }
    ]);
    if (error) alert(error.message);
    else setExpenseInput({ category: '', type: 'Monthly Fixed', amount: '', date: '', note: '' });
  };

  const handleAddEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from('employees').insert([employeeInput]);
    if (error) alert(error.message);
    else setEmployeeInput({ name: '', phone: '', role: '' });
  };

  const handleCheckIn = async (employeeId: string) => {
    if (!supabase) return;
    const now = new Date();
    const isoTime = now.toISOString();
    const { error } = await supabase.from('attendance').insert([
      {
        employee_id: employeeId,
        check_in: isoTime,
        date: isoTime.slice(0, 10),
      }
    ]);
    if (error) alert(error.message);
  };

  const handleCheckOut = async (attendanceId: string) => {
    if (!supabase) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('attendance').update({ check_out: now }).eq('id', attendanceId);
    if (error) alert(error.message);
  };

  const totalSales = useMemo(() => sales.reduce((acc, curr) => acc + (Number(curr.actual_cash) || 0), 0), [sales]);
  const totalDirectExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [expenses]);
  const totalCustomerExpenses = useMemo(() => customerExp.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [customerExp]);
  const totalUpgradeExpenses = useMemo(() => upgrades.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0), [upgrades]);
  const totalMaintExpenses = useMemo(() => maintenance.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0), [maintenance]);
  const netProfit = useMemo(
    () => totalSales - (totalDirectExpenses + totalCustomerExpenses + totalUpgradeExpenses + totalMaintExpenses),
    [totalSales, totalDirectExpenses, totalCustomerExpenses, totalUpgradeExpenses, totalMaintExpenses]
  );

  const todaySales = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return sales.reduce((acc, curr) => (curr.date === today ? acc + (Number(curr.actual_cash) || 0) : acc), 0);
  }, [sales]);

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return sales.reduce((acc, curr) => {
      const date = new Date(curr.date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        return acc + (Number(curr.actual_cash) || 0);
      }
      return acc;
    }, 0);
  }, [sales]);

  const employeesPresent = useMemo(
    () => attendance.filter((record) => record.check_in && !record.check_out).length,
    [attendance]
  );

  const lowStockAlerts = useMemo(
    () => [
      ...consumables.filter((item) => item.quantity <= item.restock_level),
      ...drinks.filter((item) => item.quantity <= 15),
    ].length,
    [consumables, drinks]
  );

  const pageTitle = navItems.find((item) => item.id === activeTab)?.label || 'Dashboard';

  const exportData = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Sales', totalSales.toFixed(2)],
      ['Direct Expenses', totalDirectExpenses.toFixed(2)],
      ['Customer Expenses', totalCustomerExpenses.toFixed(2)],
      ['Upgrade Expenses', totalUpgradeExpenses.toFixed(2)],
      ['Maintenance Expenses', totalMaintExpenses.toFixed(2)],
      ['Net Profit', netProfit.toFixed(2)],
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shega-cafe-summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Supabase is not configured</h1>
          <p className="mt-3 text-slate-600">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.25),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_20%)]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
          <div className="grid w-full max-w-6xl gap-8 rounded-4xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                <span className="text-lg">☕</span>
                <span>Shega Café Premium ERP</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">Welcome back to your cafe command center</h1>
                <p className="mt-4 max-w-xl text-slate-200">Sign in to manage sales, inventory, staff, and maintenance with a polished restaurant dashboard designed for Shega Café.</p>
              </div>
              <div className="rounded-4xl overflow-hidden border border-white/10 bg-white/10 shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                  alt="Shega Café interior"
                  className="h-72 w-full object-cover"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white/90 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Instant insight</p>
                  <p className="mt-3 text-lg font-semibold text-white">Real-time sales & stock tracking</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white/90 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Secure access</p>
                  <p className="mt-3 text-lg font-semibold text-white">Admin-only management gateway</p>
                </div>
              </div>
              <div className="rounded-3xl border border-emerald-300/20 bg-white/10 p-5 text-slate-200 backdrop-blur-md">
                <p className="text-sm">Use your café admin credentials to unlock reports, staff attendance, vendor invoices, and inventory controls. Designed for hospitality teams that need clarity and speed.</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-8 shadow-xl backdrop-blur-2xl">
              <div className="mb-6 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">Admin login</p>
                <h2 className="mt-4 text-3xl font-bold text-white">Sign in to Shega Café</h2>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-white/15 bg-slate-950/35 px-4 py-3 text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-white/15 bg-slate-950/35 px-4 py-3 text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/25"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-3xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400/90"
                >
                  Enter the restaurant dashboard
                </button>
              </form>
              <div className="mt-6 rounded-3xl border border-white/15 bg-slate-950/30 p-4 text-sm text-slate-300 backdrop-blur-md">
                <p className="font-medium text-white">Need access?</p>
                <p className="mt-2">Contact your restaurant manager for the correct admin credentials.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const contextValue = {
    session,
    sales,
    expenses,
    employees,
    attendance,
    assets,
    consumables,
    drinks,
    customerExp,
    upgrades,
    maintenance,
    salesInput,
    setSalesInput,
    expenseInput,
    setExpenseInput,
    employeeInput,
    setEmployeeInput,
    filterDate,
    setFilterDate,
    getSaleDifference,
    getSaleStatus,
    handleLogout,
    handleAddSales,
    handleAddExpense,
    handleAddEmployee,
    handleCheckIn,
    handleCheckOut,
    totalSales,
    totalDirectExpenses,
    totalCustomerExpenses,
    totalUpgradeExpenses,
    totalMaintExpenses,
    netProfit,
    exportData,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
        <aside className="w-full md:w-72 bg-slate-950 text-slate-200 flex flex-col md:sticky md:top-0 md:h-screen">
          <div className="p-6 border-b border-slate-800">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">shega cafe</p>
            <h1 className="mt-3 text-2xl font-bold text-white">Restaurant ERP</h1>
            <p className="mt-2 text-slate-400 text-sm">Operations, finance, staff and inventory in one place.</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((tab) => (
              <Link key={tab.id} href={tab.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 transition">Log out</button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shega Café ERP</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">{pageTitle}</h2>
              </div>
              <div className="flex flex-1 items-center gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
                  <input
                    type="search"
                    placeholder="Search staff, inventory, reports..."
                    className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>
                <button className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50">
                  🔔
                  <span className="sr-only">Notifications</span>
                </button>
                <button className="inline-flex h-12 items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">S</span>
                  <span className="text-left leading-tight">
                    <span className="block text-xs text-slate-500">Admin</span>
                    <span className="block font-semibold">Shega</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative h-56 bg-slate-900 text-white flex items-end overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1541544180451-8ccc0b7beb44?auto=format&fit=crop&w=1400&q=80"
              alt="Restaurant dashboard banner"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="relative z-10 p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Welcome to</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Shega Café Management System</h2>
                <p className="mt-2 max-w-2xl text-slate-200">Manage finance, staff, inventory and operations in one place with a premium restaurant ERP experience.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Today’s Sales</p>
                  <p className="mt-2 text-xl font-semibold text-white">${todaySales.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Net Profit</p>
                  <p className="mt-2 text-xl font-semibold text-white">${netProfit.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Staff Present</p>
                  <p className="mt-2 text-xl font-semibold text-white">{employeesPresent}</p>
                </div>
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Low Stock</p>
                  <p className="mt-2 text-xl font-semibold text-white">{lowStockAlerts}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-4">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Today’s Sales</p>
              <p className="mt-4 text-3xl font-bold text-emerald-800">${todaySales.toFixed(2)}</p>
              <p className="mt-2 text-sm text-slate-600">Real-time cash and POS breakeven tracking.</p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Monthly Revenue</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">${monthlyRevenue.toFixed(2)}</p>
              <p className="mt-2 text-sm text-slate-600">Revenue for the active month so far.</p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total Expenses</p>
              <p className="mt-4 text-3xl font-bold text-rose-700">${totalDirectExpenses.toFixed(2)}</p>
              <p className="mt-2 text-sm text-slate-600">Operating spend across expense categories.</p>
            </div>
            <div className={`rounded-3xl border p-6 shadow-sm ${netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-xs uppercase tracking-[0.25em] ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Net Profit</p>
              <p className={`text-3xl font-bold mt-4 ${netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>${netProfit.toFixed(2)}</p>
              <p className="mt-2 text-sm text-slate-600">Profit after all tracked costs.</p>
            </div>
          </div>

          <div className="grid gap-4 p-6 xl:grid-cols-3">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
              <div className="mt-5 h-40 rounded-3xl bg-linear-to-r from-emerald-50 via-slate-50 to-slate-50 p-4">
                <div className="h-full rounded-3xl bg-white shadow-inner" />
              </div>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Expense Mix</h3>
              <div className="mt-5 h-40 rounded-3xl bg-linear-to-r from-rose-50 via-slate-50 to-slate-50 p-4">
                <div className="h-full rounded-3xl bg-white shadow-inner" />
              </div>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Performance Snapshot</h3>
              <div className="mt-5 h-40 rounded-3xl bg-linear-to-r from-blue-50 via-slate-50 to-slate-50 p-4">
                <div className="h-full rounded-3xl bg-white shadow-inner" />
              </div>
            </div>
          </div>

          <div className="p-6">{children}</div>
          <footer className="border-t border-slate-200 bg-slate-50 px-6 py-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>Shega Café • Restaurant & Business Management ERP.</p>
              <p>© {new Date().getFullYear()} Shega Café — fast operations, premium reporting, and intuitive staff control.</p>
            </div>
          </footer>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}

type DashboardContextType = {
  session: Session;
  sales: any[];
  expenses: any[];
  employees: any[];
  attendance: any[];
  assets: any[];
  consumables: any[];
  drinks: any[];
  customerExp: any[];
  upgrades: any[];
  maintenance: any[];
  salesInput: { date: string; system_sales: string; actual_cash: string };
  setSalesInput: React.Dispatch<React.SetStateAction<{ date: string; system_sales: string; actual_cash: string }>>;
  expenseInput: { category: string; type: string; amount: string; date: string; note: string };
  setExpenseInput: React.Dispatch<React.SetStateAction<{ category: string; type: string; amount: string; date: string; note: string }>>;
  employeeInput: { name: string; phone: string; role: string };
  setEmployeeInput: React.Dispatch<React.SetStateAction<{ name: string; phone: string; role: string }>>;
  filterDate: string;
  setFilterDate: React.Dispatch<React.SetStateAction<string>>;
  getSaleDifference: (sale: any) => number;
  getSaleStatus: (sale: any) => string;
  handleLogout: () => Promise<void>;
  handleAddSales: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleAddExpense: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleAddEmployee: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleCheckIn: (employeeId: string) => Promise<void>;
  handleCheckOut: (attendanceId: string) => Promise<void>;
  totalSales: number;
  totalDirectExpenses: number;
  totalCustomerExpenses: number;
  totalUpgradeExpenses: number;
  totalMaintExpenses: number;
  netProfit: number;
  exportData: () => void;
};
