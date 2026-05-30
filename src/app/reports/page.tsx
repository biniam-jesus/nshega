'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function ReportsContent() {
  const { totalSales, totalDirectExpenses, netProfit, exportData } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Reports Center</h1>
            <p className="mt-2 text-slate-600">Run daily, weekly, monthly, and annual reports to keep stakeholders aligned.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">PDF</button>
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Excel</button>
            <button onClick={exportData} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">CSV</button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Daily Reports</h2>
          <p className="mt-3 text-slate-600">Snapshot of cashflow, sales, and operational counts for today.</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Monthly Reports</h2>
          <p className="mt-3 text-slate-600">Revenue and expense summaries across the current month.</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Annual Reports</h2>
          <p className="mt-3 text-slate-600">High-level business performance for the full year.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Revenue</p>
            <p className="mt-3 text-2xl font-bold text-emerald-800">${totalSales.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Expenses</p>
            <p className="mt-3 text-2xl font-bold text-rose-700">${totalDirectExpenses.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Net Profit</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">${netProfit.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ReportsPage() {
  return (
    <DashboardProvider activeTab="reports">
      <ReportsContent />
    </DashboardProvider>
  );
}
