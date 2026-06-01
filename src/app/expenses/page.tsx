'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

ChartJS.register(ArcElement, Tooltip, Legend);

const EXPENSE_CATEGORIES = [
  'Salary',
  'Electricity',
  'Water',
  'Tax',
  'Cheese',
  'Chicken',
  'Bread',
  'Injera',
  'Fruits',
  'Vegetables',
  'Meat',
  'Rent',
  'Hosting',
];

const EXPENSE_TYPES = [
  'Monthly Fixed',
  'Monthly Supplies',
  'Weekly',
  'Twice weekly',
  'Quarterly',
];

function ExpensesContent() {
  const { expenses, filterDate, setFilterDate, expenseInput, setExpenseInput, handleAddExpense } = useDashboard();

  const categoryTotals = EXPENSE_CATEGORIES.map((category) => ({
    category,
    amount: expenses.filter((item) => item.category === category).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
  }));

  const chartData = {
    labels: categoryTotals.filter(c => c.amount > 0).map(c => c.category),
    datasets: [
      {
        data: categoryTotals.filter(c => c.amount > 0).map(c => c.amount),
        backgroundColor: [
          '#10b981', // emerald-500
          '#3b82f6', // blue-500
          '#6366f1', // indigo-500
          '#8b5cf6', // violet-500
          '#d946ef', // fuchsia-500
          '#f43f5e', // rose-500
          '#f97316', // orange-500
          '#eab308', // yellow-500
          '#84cc16', // lime-500
          '#06b6d4', // cyan-500
          '#0ea5e9', // sky-500
          '#14b8a6', // teal-500
          '#475569', // slate-600
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Expenses Engine</h1>
        <p className="mt-2 text-slate-600">Record expenses by category, type, and date to keep cashflow visibility sharp.</p>
        
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            {categoryTotals.slice(0, 4).map((item) => (
              <div key={item.category} className="rounded-3xl bg-slate-50 p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.category}</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">${item.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[220px]">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-4">Spending Split</p>
            <div className="w-full h-full max-h-[160px] flex items-center justify-center">
              {categoryTotals.some(c => c.amount > 0) ? (
                <Doughnut 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '75%'
                  }} 
                />
              ) : (
                <p className="text-sm text-slate-400 italic">No data to display</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleAddExpense} className="mt-6 grid gap-4 xl:grid-cols-5 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Category</label>
            <select required value={expenseInput.category} onChange={(e) => setExpenseInput({ ...expenseInput, category: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white">
              <option value="" disabled>Select Category</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Expense Type</label>
            <select value={expenseInput.type} onChange={(e) => setExpenseInput({ ...expenseInput, type: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white">
              <option value="" disabled>Select Type</option>
              {EXPENSE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Amount ($)</label>
            <input type="number" step="0.01" required value={expenseInput.amount} onChange={(e) => setExpenseInput({ ...expenseInput, amount: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Date</label>
            <input type="date" required value={expenseInput.date} onChange={(e) => setExpenseInput({ ...expenseInput, date: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Note</label>
            <input type="text" value={expenseInput.note} onChange={(e) => setExpenseInput({ ...expenseInput, note: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <button type="submit" className="xl:col-span-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 transition">Log Expense</button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Expense Ledger</h2>
            <p className="text-sm text-slate-500">Filter and review cost entries by transaction date.</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-xl border border-slate-300 p-2 text-sm" />
            <button type="button" onClick={() => setFilterDate('')} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm">Clear</button>
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Category</th>
              <th className="p-4">Type</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {expenses.filter((item) => !filterDate || item.date === filterDate).map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50/60">
                <td className="p-4 font-medium">{exp.date}</td>
                <td className="p-4">{exp.category}</td>
                <td className="p-4 text-slate-500">{exp.type}</td>
                <td className="p-4 text-rose-600 font-semibold">-${Number(exp.amount).toFixed(2)}</td>
                <td className="p-4 text-slate-500">{exp.note || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ExpensesPage() {
  return (
    <DashboardProvider activeTab="expenses">
      <ExpensesContent />
    </DashboardProvider>
  );
}
