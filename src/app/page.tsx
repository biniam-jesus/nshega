'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function OverviewContent() {
  const { sales, expenses, employees, assets, upgrades, netProfit, totalSales } = useDashboard();
  const recentSales = sales.slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Welcome back, Operations Lead</h2>
          <p className="mt-3 text-slate-600">Use the navigation panel to inspect sales, expenses, staff, inventory and upgrades with live Supabase sync.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Revenue Today</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">${totalSales.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active Staff</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{employees.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Operational highlights</h3>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li>Inventory on hand: {assets.length} assets, {upgrades.length} upgrade records.</li>
            <li>Expense categories tracked: {expenses.length}</li>
            <li>Recent staff snapshots available in Staff & Attendance.</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Recent Sales Entries</h3>
          <div className="mt-4 space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-slate-500">No recent sales data yet. Add a new entry through the Sales Tracker.</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                  <p className="text-sm text-slate-500">{new Date(sale.date).toLocaleDateString()}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">Actual Cash: ${Number(sale.actual_cash).toFixed(2)}</p>
                  <p className="text-sm text-slate-600">Status: {sale.status} · Difference: ${Number(sale.difference).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </article>
        <article className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Operational Fiscal Pulse</h3>
          <div className="mt-4 text-slate-600">
            <p className="mb-3">Net operating delta gives you at-a-glance margin health across sales, expenses, upgrades, and maintenance.</p>
            <p className="font-semibold text-slate-900">Current net figure: ${netProfit.toFixed(2)}</p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <DashboardProvider activeTab="overview">
      <OverviewContent />
    </DashboardProvider>
  );
}
