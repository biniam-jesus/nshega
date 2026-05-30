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
  { id: 'overview', label: 'Dashboard Overview', href: '/' },
  { id: 'sales', label: 'Daily Sales Tracker', href: '/sales' },
  { id: 'expenses', label: 'Expenses Engine', href: '/expenses' },
  { id: 'staff', label: 'Staff & Attendance', href: '/staff' },
  { id: 'inventory', label: 'Inventory Matrix', href: '/inventory' },
  { id: 'operational', label: 'Operations & Upgrades', href: '/operations' },
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
    const att = await supabase.from('attendance').select('*, employees(name)');
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

  const totalSales = useMemo(() => sales.reduce((acc, curr) => acc + (Number(curr.actual_cash) || 0), 0), [sales]);
  const totalDirectExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [expenses]);
  const totalCustomerExpenses = useMemo(() => customerExp.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [customerExp]);
  const totalUpgradeExpenses = useMemo(() => upgrades.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0), [upgrades]);
  const totalMaintExpenses = useMemo(() => maintenance.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0), [maintenance]);
  const netProfit = useMemo(() => totalSales - (totalDirectExpenses + totalCustomerExpenses + totalUpgradeExpenses + totalMaintExpenses), [totalSales, totalDirectExpenses, totalCustomerExpenses, totalUpgradeExpenses, totalMaintExpenses]);

  const exportData = () => {
    window.print();
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
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800">Daily Business Control System</h2>
            <p className="text-slate-500 mt-2">Admin access for dashboard operations, inventory, staff, and finance.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition duration-200">Authenticate Access</button>
          </form>
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
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col">
          <div className="p-5 border-b border-slate-800 flex items-center space-x-2">
            <span className="text-xl font-bold text-emerald-400">Daily Business Control</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">System</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((tab) => (
              <Link key={tab.id} href={tab.href} className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                {tab.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-md text-sm font-medium transition">
              Terminate Session
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="relative h-48 bg-slate-800 text-white flex items-end">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
              alt="Dashboard Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-multiply"
            />
            <div className="relative z-10 p-6 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Daily Business Control System</h1>
                <p className="text-slate-300 text-sm mt-1">Modern restaurant dashboard for sales, staff, inventory, and financial control.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-white text-slate-900 rounded px-3 py-1.5 text-sm outline-none font-medium"
                />
                {filterDate && (
                  <button onClick={() => setFilterDate('')} className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-sm rounded">Clear</button>
                )}
                <button onClick={exportData} className="bg-emerald-600 hover:bg-emerald-500 font-semibold px-4 py-1.5 rounded text-sm transition">
                  Export Layout
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white border-b border-slate-200">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Gross Capital Inflow</span>
              <p className="text-2xl font-bold text-emerald-900 mt-1">${totalSales.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Direct System Expenses</span>
              <p className="text-2xl font-bold text-rose-900 mt-1">${totalDirectExpenses.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Auxiliary Adjustments</span>
              <p className="text-2xl font-bold text-amber-900 mt-1">${(totalCustomerExpenses + totalUpgradeExpenses + totalMaintExpenses).toFixed(2)}</p>
            </div>
            <div className={`p-4 border rounded-xl ${netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Net Operating Delta</span>
              <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>${netProfit.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-6">{children}</div>
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
  totalSales: number;
  totalDirectExpenses: number;
  totalCustomerExpenses: number;
  totalUpgradeExpenses: number;
  totalMaintExpenses: number;
  netProfit: number;
  exportData: () => void;
};
