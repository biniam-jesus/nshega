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

export default function DashboardProvider({ activeTab, children }: { activeTab: string; children: ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [customerExp, setCustomerExp] = useState<any[]>([]);
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [salesInput, setSalesInput] = useState({ date: '', system_sales: '', actual_cash: '' });
  const [expenseInput, setExpenseInput] = useState({ category: '', type: 'Monthly Fixed', amount: '', date: '', note: '' });
  const [employeeInput, setEmployeeInput] = useState({ name: '', phone: '', role: '' });
  const [purchasesInput, setPurchasesInput] = useState({ item_name: '', category: '', quantity: '1', unit_price: '', total_price: '', cash_used: '', supplier_id: '', supplier_name: '', payment_method: '', purchase_date: '', notes: '' });
  const [filterDate, setFilterDate] = useState('');

  const navItems = useMemo(() => [
    { id: 'overview', label: 'Dashboard', href: '/', icon: '📊' },
    { id: 'sales', label: 'Daily Sales', href: '/sales', icon: '💵' },
    { id: 'expenses', label: 'Expenses', href: '/expenses', icon: '🧾' },
    { id: 'profit-loss', label: 'Profit & Loss', href: '/profit-loss', icon: '📈' },
    { id: 'purchases', label: 'Purchases', href: '/purchases', icon: '🛒' },
    { id: 'operations', label: 'Operations', href: '/operations', icon: '⚙️' },
    { id: 'staff', label: 'Staff Management', href: '/staff', icon: '👥' },
    { id: 'attendance', label: 'Attendance', href: '/attendance', icon: '⏱️' },
    { id: 'inventory', label: 'Inventory', href: '/inventory', icon: '🥖' },
    { id: 'drinks', label: 'Drinks', href: '/drinks_inventory', icon: '🥤' },
    { id: 'assets', label: 'Assets', href: '/assets', icon: '🏷️' },
    { id: 'maintenance', label: 'Maintenance', href: '/maintenance', icon: '🔧' },
    { id: 'upgrades', label: 'Upgrades', href: '/upgrades', icon: '🚀' },
    { id: 'reports', label: 'Reports', href: '/reports', icon: '🗂️' },
    { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' },
  ], []);

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

  // Set default dates on mount to avoid Hydration Mismatch between SSR and Client
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setSalesInput(prev => ({ ...prev, date: today }));
    setExpenseInput(prev => ({ ...prev, date: today }));
    setPurchasesInput(prev => ({ ...prev, purchase_date: today }));
  }, []);

  useEffect(() => {
    if (!supabase || !session) return;
    fetchBranches();
  }, [session, supabase]);

  useEffect(() => {
    if (!supabase || !session || !selectedBranchId) return;
    fetchAllData(selectedBranchId);
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [session, supabase, selectedBranchId]);

  const fetchBranches = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('branches').select('*').eq('active', true);
    if (data) {
      setBranches(data);
      if (data.length > 0 && !selectedBranchId) {
        setSelectedBranchId(data[0].id);
      }
    }
  };

  const fetchAllData = async (branchId: string) => {
    if (!supabase) return;
    const filter = { branch_id: branchId };
    
    const [s, e, emp, att, ast, sup, con, drk, cust, upg, maint, pur] = await Promise.all([
      supabase.from('daily_sales').select('*').match(filter).order('date', { ascending: false }),
      supabase.from('expenses').select('*').match(filter).order('date', { ascending: false }),
      supabase.from('employees').select('*').match(filter),
      supabase.from('attendance').select('*, employees(name)').match(filter).order('date', { ascending: false }),
      supabase.from('assets').select('*').match(filter),
      supabase.from('suppliers').select('*').match(filter),
      supabase.from('consumables').select('*').match(filter),
      supabase.from('drinks_stock').select('*').match(filter),
      supabase.from('customer_expenses').select('*').match(filter),
      supabase.from('upgrades').select('*').match(filter),
      supabase.from('maintenance').select('*').match(filter),
      supabase.from('purchases').select('*').match(filter).order('purchase_date', { ascending: false }),
    ]);

    if (s.data) setSales(s.data);
    if (e.data) setExpenses(e.data);
    if (emp.data) setEmployees(emp.data);
    if (att.data) setAttendance(att.data);
    if (ast.data) setAssets(ast.data);
    if (sup.data) setSuppliers(sup.data);
    if (con.data) setConsumables(con.data);
    if (drk.data) setDrinks(drk.data);
    if (cust.data) setCustomerExp(cust.data);
    if (upg.data) setUpgrades(upg.data);
    if (maint.data) setMaintenance(maint.data);
    if (pur.data) setPurchases(pur.data);
  };

  const setupRealtimeSubscriptions = () => {
    if (!supabase) return;
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        if (selectedBranchId) fetchAllData(selectedBranchId);
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
    if (!supabase || !selectedBranchId) return;
    const systemSales = parseFloat(salesInput.system_sales);
    const actualCash = parseFloat(salesInput.actual_cash);
    const difference = Number((actualCash - systemSales).toFixed(2));
    const status = difference === 0 ? 'Match' : difference < 0 ? 'Shortage' : 'Extra';

    const { error } = await supabase.from('daily_sales').insert([
      {
        branch_id: selectedBranchId,
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
    if (!supabase || !selectedBranchId) return;
    const { error } = await supabase.from('expenses').insert([
      { ...expenseInput, branch_id: selectedBranchId, amount: parseFloat(expenseInput.amount) }
    ]);
    if (error) alert(error.message);
    else setExpenseInput({ category: '', type: 'Monthly Fixed', amount: '', date: '', note: '' });
  };

  const handleAddEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase || !selectedBranchId) return;
    const { error } = await supabase.from('employees').insert([{ ...employeeInput, branch_id: selectedBranchId }]);
    if (error) alert(error.message);
    else setEmployeeInput({ name: '', phone: '', role: '' });
  };

  const handleAddPurchase = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase || !selectedBranchId) return;
    
    // Destructure to exclude total_price as it is a generated column in Supabase
    const { total_price, ...restInput } = purchasesInput;

    const insertData = {
      ...restInput,
      branch_id: selectedBranchId,
      quantity: parseInt(purchasesInput.quantity),
      unit_price: parseFloat(purchasesInput.unit_price),
      cash_used: parseFloat(purchasesInput.cash_used),
      supplier_id: purchasesInput.supplier_id || null
    };

    const { error } = await supabase.from('purchases').insert([insertData]);
    if (error) alert(error.message);
    else {
      setPurchasesInput({ item_name: '', category: '', quantity: '1', unit_price: '', total_price: '', cash_used: '', supplier_id: '', supplier_name: '', payment_method: '', purchase_date: new Date().toISOString().slice(0, 10), notes: '' });
    }
  };

  const handleCheckIn = async (employeeId: string) => {
    if (!supabase || !selectedBranchId) return;
    const now = new Date();
    const isoTime = now.toISOString();
    const { error } = await supabase.from('attendance').insert([
      {
        branch_id: selectedBranchId,
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

  const totalPurchases = useMemo(() => purchases.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0), [purchases]);

  const monthlyPurchases = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return purchases.reduce((acc, curr) => {
      const date = new Date(curr.purchase_date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        return acc + (Number(curr.total_price) || 0);
      }
      return acc;
    }, 0);
  }, [purchases]);

  const categoryPurchases = useMemo(() => {
    const cats: Record<string, number> = {};
    purchases.forEach((p) => {
      cats[p.category] = (cats[p.category] || 0) + (Number(p.total_price) || 0);
    });
    return Object.entries(cats).map(([category, total]) => ({ category, total }));
  }, [purchases]);

  const supplierPurchases = useMemo(() => {
    const sups: Record<string, number> = {};
    purchases.forEach((p) => {
      sups[p.supplier_name] = (sups[p.supplier_name] || 0) + (Number(p.total_price) || 0);
    });
    return Object.entries(sups).map(([supplier_name, total]) => ({ supplier_name, total })).sort((a, b) => b.total - a.total);
  }, [purchases]);

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
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-emerald-500/30 [perspective:2000px]">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse [transform:translateZ(-200px)]" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[60%] w-[60%] rounded-full bg-sky-500/10 blur-[120px] animate-pulse [animation-delay:2s] [transform:translateZ(-150px)]" />
          
          {/* Floating 3D-like Geometric Elements */}
          <div className="absolute top-1/4 left-10 w-24 h-24 border border-white/10 bg-white/5 rounded-2xl backdrop-blur-xl animate-bounce [animation-duration:6s] [transform:rotateX(45deg)_rotateY(45deg)_translateZ(100px)] shadow-2xl" />
          <div className="absolute bottom-1/4 right-20 w-32 h-32 border border-white/10 bg-white/5 rounded-full backdrop-blur-xl animate-bounce [animation-duration:8s] [animation-delay:1s] [transform:rotateX(-20deg)_rotateY(30deg)_translateZ(150px)] shadow-2xl" />
          <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-emerald-500/20 bg-emerald-500/5 rounded-lg backdrop-blur-lg animate-pulse [transform:rotateZ(45deg)_translateZ(50px)]" />
        </div>
        
        {/* Visual Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.1),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.05),transparent_40%)]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10 grayscale mix-blend-luminosity" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12 transition-opacity duration-1000 animate-in fade-in [transform-style:preserve-3d]">
          <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr] items-center [transform-style:preserve-3d]">
            {/* Left Column: Branding */}
            <div className="space-y-10 [transform:translateZ(50px)]">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 backdrop-blur-md shadow-lg">
                <span className="text-lg">☕</span>
                <span>Shega Café ERP</span>
              </div>
              <div className="space-y-6">
                <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl drop-shadow-2xl">
                  Command your <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">restaurant empire.</span>
                </h1>
                <p className="max-w-md text-lg text-slate-400 leading-relaxed">
                  Real-time analytics, inventory mastery, and staff control—engineered for the high-speed rhythm of Shega Café.
                </p>
              </div>
              <div className="relative group max-w-xl">
                <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/20 to-sky-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                  alt="Shega Café atmosphere"
                  className="h-72 w-full object-cover opacity-60 transition-transform duration-[3s] group-hover:scale-110"
                />
                </div>
              </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="relative group [transform-style:preserve-3d] transition-transform duration-700 hover:[transform:rotateY(-5deg)_rotateX(2deg)]">
              <div className="absolute -inset-0.5 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent blur-sm"></div>
              {/* Form Shadow Depth Layer */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-black/40 blur-2xl translate-y-8 translate-z-[-20px]" />
              
              <div className="relative rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl [transform:translateZ(80px)]">
                <div className="mb-10 text-center [transform:translateZ(20px)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400">Secure Access</p>
                  <h2 className="mt-4 text-3xl font-bold text-white tracking-tight">Admin Terminal</h2>
                  <p className="mt-2 text-sm text-slate-400 font-medium">Verify credentials to initialize session.</p>
              </div>

                <form onSubmit={handleLogin} className="space-y-6 [transform:translateZ(30px)]">
                  <div className="space-y-2 group/input">
                    <label className="ml-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shegacafe.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-6 py-4 text-white placeholder:text-slate-700 outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 group-hover/input:bg-slate-900/70"
                  />
                </div>
                  <div className="space-y-2 group/input">
                    <label className="ml-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Security Key</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-6 py-4 text-white placeholder:text-slate-700 outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 group-hover/input:bg-slate-900/70"
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-2xl bg-emerald-500 py-4.5 text-sm font-bold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98] [transform:translateZ(10px)]"
                >
                  <span className="relative flex items-center justify-center gap-2 transition-transform group-hover:scale-105">
                    Unlock Dashboard
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </button>
              </form>

                <div className="mt-10 flex items-center gap-4 opacity-20 [transform:translateZ(10px)]">
                  <div className="h-px flex-1 bg-white" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Authorized Only</span>
                  <div className="h-px flex-1 bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const contextValue = {
    session,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    sales,
    expenses,
    employees,
    attendance,
    assets,
    suppliers,
    consumables,
    drinks,
    customerExp,
    upgrades,
    maintenance,
    purchases,
    salesInput,
    setSalesInput,
    expenseInput,
    setExpenseInput,
    employeeInput,
    setEmployeeInput,
    purchasesInput,
    setPurchasesInput,
    filterDate,
    setFilterDate,
    getSaleDifference,
    getSaleStatus,
    handleLogout,
    handleAddSales,
    handleAddExpense,
    handleAddEmployee,
    handleAddPurchase,
    handleCheckIn,
    handleCheckOut,
    totalSales,
    totalDirectExpenses,
    totalCustomerExpenses,
    totalUpgradeExpenses,
    totalMaintExpenses,
    totalPurchases,
    monthlyPurchases,
    categoryPurchases,
    supplierPurchases,
    netProfit,
    exportData,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row selection:bg-emerald-500/20 relative overflow-hidden">
        {/* Subtle Dashboard Background Depth */}
        <div className="absolute -top-[10%] -right-[5%] h-[40%] w-[40%] rounded-full bg-emerald-500/[0.03] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] -left-[5%] h-[30%] w-[30%] rounded-full bg-sky-500/[0.03] blur-[80px] pointer-events-none" />

        {/* Desktop Sidebar - Hidden on Mobile */}
        <aside className="hidden md:flex w-72 bg-slate-950 text-slate-200 flex-col md:sticky md:top-0 md:h-screen z-30">
          <div className="p-8 border-b border-white/5">
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

        {/* Mobile Bottom Navigation - Visible only on small screens */}
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around rounded-3xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          {navItems.slice(0, 5).map((tab) => (
            <Link 
              key={tab.id} 
              href={tab.href} 
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition-all active:scale-95 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[9px] font-medium leading-tight text-center px-1 wrap-break-word max-w-full">
                {tab.label}
              </span>
            </Link>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-3">
                <div className="md:hidden h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-950 text-xl shadow-lg ring-1 ring-white/10">☕</div>
                <div>
                  <p className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Shega ERP</p>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">{pageTitle}</h2>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
                <div className="hidden lg:relative lg:flex-1 lg:group lg:block">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
                {/* Branch Switcher Dropdown */}
                <div className="relative group">
                  <select 
                    value={selectedBranchId || ''} 
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none pr-10 shadow-sm"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</span>
                </div>
                <button className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50">
                  🔔
                  <span className="sr-only">Notifications</span>
                </button>
                <button className="inline-flex h-11 items-center gap-3 rounded-2xl bg-white border border-slate-200 px-2 sm:px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">S</span>
                  <span className="hidden sm:block text-left leading-tight">
                    <span className="block text-xs text-slate-500">Admin</span>
                    <span className="block font-semibold">Shega</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative h-48 md:h-56 bg-slate-900 text-white flex items-end overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1541544180451-8ccc0b7beb44?auto=format&fit=crop&w=1400&q=80"
              alt="Restaurant dashboard banner"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="relative z-10 p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 opacity-80">Welcome back</p>
                <h2 className="mt-1 text-2xl md:text-3xl font-black tracking-tight">Shega Café Control</h2>
                <p className="hidden sm:block mt-1 max-w-2xl text-slate-300 text-sm">Real-time hospitality management for the modern café owner.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3">
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Sales</p>
                  <p className="mt-2 text-xl font-semibold text-white">${todaySales.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Net Profit</p>
                  <p className="mt-2 text-xl font-semibold text-white">${netProfit.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Staff</p>
                  <p className="mt-2 text-xl font-semibold text-white">{employeesPresent}</p>
                </div>
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Low Stock</p>
                  <p className="mt-2 text-xl font-semibold text-white">{lowStockAlerts}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 md:p-6 xl:grid-cols-4">
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

          <div className="grid gap-4 p-4 md:p-6 xl:grid-cols-3">
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
            <div className="mx-auto flex max-w-7xl flex-col gap-3 text-[10px] sm:text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
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
  branches: any[];
  selectedBranchId: string | null;
  setSelectedBranchId: React.Dispatch<React.SetStateAction<string | null>>;
  sales: any[];
  expenses: any[];
  employees: any[];
  attendance: any[];
  assets: any[];
  suppliers: any[];
  consumables: any[];
  drinks: any[];
  customerExp: any[];
  upgrades: any[];
  maintenance: any[];
  purchases: any[];
  salesInput: { date: string; system_sales: string; actual_cash: string };
  setSalesInput: React.Dispatch<React.SetStateAction<{ date: string; system_sales: string; actual_cash: string }>>;
  expenseInput: { category: string; type: string; amount: string; date: string; note: string };
  setExpenseInput: React.Dispatch<React.SetStateAction<{ category: string; type: string; amount: string; date: string; note: string }>>;
  employeeInput: { name: string; phone: string; role: string };
  setEmployeeInput: React.Dispatch<React.SetStateAction<{ name: string; phone: string; role: string }>>;
  purchasesInput: any;
  setPurchasesInput: React.Dispatch<React.SetStateAction<any>>;
  filterDate: string;
  setFilterDate: React.Dispatch<React.SetStateAction<string>>;
  getSaleDifference: (sale: any) => number;
  getSaleStatus: (sale: any) => string;
  handleLogout: () => Promise<void>;
  handleAddSales: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleAddExpense: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleAddEmployee: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleAddPurchase: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleCheckIn: (employeeId: string) => Promise<void>;
  handleCheckOut: (attendanceId: string) => Promise<void>;
  totalSales: number;
  totalDirectExpenses: number;
  totalCustomerExpenses: number;
  totalUpgradeExpenses: number;
  totalMaintExpenses: number;
  totalPurchases: number;
  monthlyPurchases: number;
  categoryPurchases: { category: string; total: number }[];
  supplierPurchases: { supplier_name: string; total: number }[];
  netProfit: number;
  exportData: () => void;
};
