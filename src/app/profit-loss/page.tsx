'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function ProfitLossContent() {
  const { totalSales, totalDirectExpenses, totalCustomerExpenses, totalUpgradeExpenses, totalMaintExpenses, netProfit } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Profit & Loss</h1>
            <p className="mt-2 text-slate-600">A consolidated review of revenue, expenses, investments and operating profitability.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">Export Report</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Gross Sales</p>
          <p className="mt-3 text-3xl font-bold text-emerald-800">${totalSales.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Operating Expenses</p>
          <p className="mt-3 text-3xl font-bold text-rose-700">${(totalDirectExpenses + totalCustomerExpenses).toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Capex & Upgrades</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">${(totalUpgradeExpenses + totalMaintExpenses).toFixed(2)}</p>
        </div>
        <div className={`rounded-3xl border p-6 shadow-sm ${netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-xs uppercase tracking-[0.25em] ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Net Profit</p>
          <p className={`mt-3 text-3xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>${netProfit.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Revenue Insights</h2>
          <p className="mt-3 text-slate-600">Track how cash inflow compares to overall spend, and optimize menu pricing accordingly.</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Expense Breakdown</h2>
          <p className="mt-3 text-slate-600">See how payroll, supplies, and operations impact your P&L and forecast future margin.</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Profit Strategy</h2>
          <p className="mt-3 text-slate-600">Use this space to manage pricing, discounts, and business decisions with clarity.</p>
        </div>
      </div>
    </section>
  );
}

export default function ProfitLossPage() {
  return (
    <DashboardProvider activeTab="profit-loss">
      <ProfitLossContent />
    </DashboardProvider>
  );
}
