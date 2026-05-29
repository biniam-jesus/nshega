'use client';

import { useState, useEffect, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';

export default function Dashboard() {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Unified State Engine
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

  // Form Inputs State
  const [salesInput, setSalesInput] = useState({ date: '', system_sales: '', actual_cash: '' });
  const [expenseInput, setExpenseInput] = useState({ category: '', type: 'Monthly Fixed', amount: '', date: '', note: '' });
  const [employeeInput, setEmployeeInput] = useState({ name: '', phone: '', role: '' });

  // Date Filter State
  const [filterDate, setFilterDate] = useState('');

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Supabase is not configured</h1>
          <p className="mt-3 text-slate-600">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchAllData();
      setupRealtimeSubscriptions();
    }
  }, [session]);

  const fetchAllData = async () => {
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
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  // Auth Functions
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Submission Handlers
  const handleAddSales = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.from('daily_sales').insert([
      { 
        date: salesInput.date, 
        system_sales: parseFloat(salesInput.system_sales), 
        actual_cash: parseFloat(salesInput.actual_cash) 
      }
    ]);
    if (error) alert(error.message);
    else setSalesInput({ date: '', system_sales: '', actual_cash: '' });
  };

  const handleAddExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.from('expenses').insert([
      { ...expenseInput, amount: parseFloat(expenseInput.amount) }
    ]);
    if (error) alert(error.message);
    else setExpenseInput({ category: '', type: 'Monthly Fixed', amount: '', date: '', note: '' });
  };

  // Financial Metric Aggregations
  const totalSales = sales.reduce((acc, curr) => acc + curr.actual_cash, 0);
  const totalDirectExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCustomerExpenses = customerExp.reduce((acc, curr) => acc + curr.amount, 0);
  const totalUpgradeExpenses = upgrades.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMaintExpenses = maintenance.reduce((acc, curr) => acc + curr.amount, 0);
  
  const netProfit = totalSales - (totalDirectExpenses + totalCustomerExpenses + totalUpgradeExpenses + totalMaintExpenses);

  // Simplified Mock Print/Export Functionality
  const exportData = () => {
    window.print();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800">BistroERP Admin</h2>
            <p className="text-slate-500 mt-2">Sign in to control your restaurant infrastructure</p>
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center space-x-2">
          <span className="text-xl font-bold text-emerald-400">BistroERP</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">v1.2</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', name: 'Dashboard Overview' },
            { id: 'sales', name: 'Daily Sales Tracker' },
            { id: 'expenses', name: 'Expenses Engine' },
            { id: 'staff', name: 'Staff & Attendance' },
            { id: 'inventory', name: 'Inventory Matrix' },
            { id: 'operational', name: 'Operations & Upgrades' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-md text-sm font-medium transition">
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Banner Segment */}
        <div className="relative h-48 bg-slate-800 text-white flex items-end">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5" 
            alt="Dashboard Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-multiply"
          />
          <div className="relative z-10 p-6 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Enterprise Administration</h1>
              <p className="text-slate-300 text-sm mt-1">Real-time control interface for your facilities</p>
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

        {/* Global Financial Metrics Strip */}
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

        <div className="p-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Sales Accuracy Status</h3>
                    <p className="text-slate-500 text-sm mt-1">Cross-referencing live data registers against physically declared cash assets.</p>
                  </div>
                  <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c" alt="Finance Visual" className="mt-4 rounded-lg h-32 object-cover w-full" />
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Supply Management</h3>
                    <p className="text-slate-500 text-sm mt-1">Monitor real-time depletion thresholds of essential kitchen consumables and raw stock.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <img src="https://images.unsplash.com/photo-1547592180-85f173990554" alt="Lunch Visual" className="rounded h-14 object-cover w-full" />
                    <img src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd" alt="Drinks Visual" className="rounded h-14 object-cover w-full" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Operational Human Capital</h3>
                    <p className="text-slate-500 text-sm mt-1">Real-time visibility into workforce check-in milestones and active duty states.</p>
                  </div>
                  <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d" alt="Team Visual" className="mt-4 rounded-lg h-32 object-cover w-full" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY SALES TRACKER */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Record Daily Balance Verification</h2>
                <form onSubmit={handleAddSales} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Operational Date</label>
                    <input type="date" required value={salesInput.date} onChange={(e) => setSalesInput({...salesInput, date: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">System Calculated Sales ($)</label>
                    <input type="number" step="0.01" required value={salesInput.system_sales} onChange={(e) => setSalesInput({...salesInput, system_sales: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Actual Hand-Over Cash ($)</label>
                    <input type="number" step="0.01" required value={salesInput.actual_cash} onChange={(e) => setSalesInput({...salesInput, actual_cash: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm" />
                  </div>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold p-2.5 rounded transition">Commit Daily Entry</button>
                </form>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50"><h3 className="font-bold">Historical Audits</h3></div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">System Matrix</th>
                      <th className="p-3">Physical Liquidity</th>
                      <th className="p-3">Discrepancy Variance</th>
                      <th className="p-3">Operational Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sales.filter(item => !filterDate || item.date === filterDate).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium">{s.date}</td>
                        <td className="p-3">${s.system_sales.toFixed(2)}</td>
                        <td className="p-3">${s.actual_cash.toFixed(2)}</td>
                        <td className={`p-3 font-semibold ${s.difference < 0 ? 'text-red-600' : s.difference > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                          ${s.difference.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.status === 'Match' ? 'bg-emerald-100 text-emerald-800' : s.status === 'Shortage' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EXPENSES ENGINE */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Log Outbound Capital (Expenses)</h2>
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Resource Identity / Category</label>
                    <input type="text" placeholder="e.g. Salary, Cheese, Water" required value={expenseInput.category} onChange={(e) => setExpenseInput({...expenseInput, category: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Lifecycle Frequency Type</label>
                    <select value={expenseInput.type} onChange={(e) => setExpenseInput({...expenseInput, type: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm bg-white">
                      <option>Monthly Fixed</option>
                      <option>Monthly Supplies</option>
                      <option>Weekly</option>
                      <option>Twice weekly</option>
                      <option>Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Valuation ($)</label>
                    <input type="number" step="0.01" required value={expenseInput.amount} onChange={(e) => setExpenseInput({...expenseInput, amount: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Transaction Date</label>
                    <input type="date" required value={expenseInput.date} onChange={(e) => setExpenseInput({...expenseInput, date: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Supplementary Note</label>
                    <input type="text" value={expenseInput.note} onChange={(e) => setExpenseInput({...expenseInput, note: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm" />
                  </div>
                  <button type="submit" className="sm:col-span-2 lg:col-span-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 rounded transition">Log Transaction</button>
                </form>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50"><h3 className="font-bold">Ledger Ledger Output</h3></div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Category Allocation</th>
                      <th className="p-3">Frequency Type</th>
                      <th className="p-3">Cost Basis</th>
                      <th className="p-3">Audit Footnote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {expenses.filter(item => !filterDate || item.date === filterDate).map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50">
                        <td className="p-3">{exp.date}</td>
                        <td className="p-3 font-semibold capitalize">{exp.category}</td>
                        <td className="p-3 text-slate-500">{exp.type}</td>
                        <td className="p-3 font-medium text-rose-600">-${exp.amount.toFixed(2)}</td>
                        <td className="p-3 text-xs text-slate-500">{exp.note || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: STAFF & ATTENDANCE */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
                  <h3 className="font-bold text-lg mb-4">Onboard Human Resource</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    await supabase.from('employees').insert([employeeInput]);
                    setEmployeeInput({ name: '', phone: '', role: '' });
                  }} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block uppercase">Legal Name</label>
                      <input type="text" required value={employeeInput.name} onChange={(e) => setEmployeeInput({...employeeInput, name: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block uppercase">Mobile Vector</label>
                      <input type="text" value={employeeInput.phone} onChange={(e) => setEmployeeInput({...employeeInput, phone: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block uppercase">Organizational Role</label>
                      <input type="text" required placeholder="e.g. Line Chef, Lead Sommelier" value={employeeInput.role} onChange={(e) => setEmployeeInput({...employeeInput, role: e.target.value})} className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm"/>
                    </div>
                    <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 text-sm rounded font-bold transition">Commit Employee File</button>
                  </form>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
                  <div className="p-4 border-b border-slate-200 bg-slate-50"><h3 className="font-bold">Active Staff Registry</h3></div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                      <tr>
                        <th className="p-3">Staff Identity</th>
                        <th className="p-3">Role Allocation</th>
                        <th className="p-3">Contact Payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td className="p-3 font-semibold">{emp.name}</td>
                          <td className="p-3 text-slate-600">{emp.role}</td>
                          <td className="p-3 text-mono text-xs text-slate-500">{emp.phone || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50"><h3 className="font-bold">Real-time Shift Attendance Matrix</h3></div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                    <tr>
                      <th className="p-3">Operational Date</th>
                      <th className="p-3">Staff Resource</th>
                      <th className="p-3">Checkpoint Inbound</th>
                      <th className="p-3">Checkpoint Outbound</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {attendance.filter(item => !filterDate || item.date === filterDate).map((att) => (
                      <tr key={att.id}>
                        <td className="p-3 font-medium">{att.date}</td>
                        <td className="p-3 font-semibold">{att.employees?.name}</td>
                        <td className="p-3 text-emerald-600 font-mono text-xs">{att.check_in}</td>
                        <td className="p-3 text-amber-600 font-mono text-xs">{att.check_out || 'Active Duty Session'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: INVENTORY MATRIX */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Consumable Frame */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-900 text-white font-bold text-sm">Consumable Storage Engine</div>
                  <div className="p-4 divide-y divide-slate-100">
                    {consumables.map((c) => (
                      <div key={c.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-500">Depletion Velocity: {c.usage_rate || 'Stable'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${c.quantity <= c.restock_level ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
                            {c.quantity} Units
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drinks & Liquids Systems */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-emerald-900 text-emerald-100 font-bold text-sm">Beverage Reserves Map</div>
                  <div className="p-4 divide-y divide-slate-100">
                    {drinks.map((d) => (
                      <div key={d.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{d.name}</p>
                          <p className="text-xs text-slate-500">Runway Burn Rate: {d.sold_per_day}/day</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${d.quantity <= 15 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {d.quantity} Packets
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-Consumable Assets */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-800 text-slate-100 font-bold text-sm">Fixed Asset Portfolios</div>
                  <div className="p-4 divide-y divide-slate-100">
                    {assets.map((a) => (
                      <div key={a.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{a.name}</p>
                          <p className="text-xs text-slate-400">Deployed: {a.purchase_date}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {a.condition}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: OPERATIONS & AUXILIARY EXPENSES */}
          {activeTab === 'operational' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-rose-50 text-rose-900 font-bold">Client Compensation Adjustments</div>
                <div className="p-4 space-y-4">
                  {customerExp.filter(item => !filterDate || item.date === filterDate).map((ce) => (
                    <div key={ce.id} className="border-l-4 border-rose-500 bg-slate-50 p-3 rounded-r">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm">{ce.reason}</span>
                        <span className="text-sm font-semibold text-rose-600">-${ce.amount.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Ref: {ce.order_reference || 'Direct Balance Adjust'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-blue-50 text-blue-900 font-bold">Capital Infrastructure Upgrades</div>
                <div className="p-4 space-y-4">
                  {upgrades.filter(item => !filterDate || item.date === filterDate).map((u) => (
                    <div key={u.id} className="border-l-4 border-blue-500 bg-slate-50 p-3 rounded-r">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm">{u.project_name}</span>
                        <span className="text-sm font-semibold text-blue-600">-${u.cost.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{u.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-amber-50 text-amber-900 font-bold">Tactical Maintenance Events</div>
                <div className="p-4 space-y-4">
                  {maintenance.filter(item => !filterDate || item.date === filterDate).map((m) => (
                    <div key={m.id} className="border-l-4 border-amber-500 bg-slate-50 p-3 rounded-r">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm">{m.item}</span>
                        <span className="text-sm font-semibold text-amber-600">-${m.cost.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Tech: {m.technician || 'Internal Asset Fix'}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}