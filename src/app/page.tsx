'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function OverviewContent() {
  const { sales, expenses, employees, assets, upgrades, consumables, drinks, netProfit, totalSales } = useDashboard();

  const todaySales = sales.reduce((acc, sale) => {
    const saleDate = new Date(sale.date).toISOString().slice(0, 10);
    return saleDate === new Date().toISOString().slice(0, 10) ? acc + (Number(sale.actual_cash) || 0) : acc;
  }, 0);

  const monthlyRevenue = sales.reduce((acc, sale) => {
    const date = new Date(sale.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() ? acc + (Number(sale.actual_cash) || 0) : acc;
  }, 0);

  const lowStockAlerts = [
    ...consumables.filter((item) => item.quantity <= item.restock_level),
    ...drinks.filter((item) => item.quantity <= 15),
  ].length;

  const recentSales = sales.slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm overflow-hidden">
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1541544180451-8ccc0b7beb44?auto=format&fit=crop&w=1400&q=80"
              alt="Shega Cafe banner"
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="relative z-10 p-6">
              <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-700">Shega Café</span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Welcome back, cafe manager</h2>
              <p className="mt-3 max-w-xl text-slate-700">Modern restaurant ERP for sales, staff, inventory, maintenance, and reports — built to feel premium and fast.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Today’s Sales</p>
                  <p className="mt-3 text-2xl font-semibold text-emerald-800">${todaySales.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Monthly Revenue</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">${monthlyRevenue.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Low Stock Alerts</p>
                  <p className="mt-3 text-2xl font-semibold text-rose-700">{lowStockAlerts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-sm">
            <p className="uppercase text-xs tracking-[0.25em] text-emerald-300">Profit snapshot</p>
            <p className="mt-4 text-3xl font-bold">${netProfit.toFixed(2)}</p>
            <p className="mt-2 text-slate-300 text-sm">Total sales less operating expenses, customer adjustments, upgrades and maintenance.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total sales</p>
              <p className="mt-3 text-2xl font-semibold text-emerald-900">${totalSales.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expense lines</p>
              <p className="mt-3 text-2xl font-semibold text-rose-700">{expenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Revenue Flow</h3>
          <p className="mt-2 text-slate-600">See how daily sales translate into business growth.</p>
          <div className="mt-5 h-32 rounded-3xl bg-linear-to-r from-emerald-50 via-slate-50 to-slate-50 p-4">
            <div className="h-full rounded-3xl bg-white shadow-inner" />
          </div>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Staff Activity</h3>
          <p className="mt-2 text-slate-600">Team availability and attendance insights for front-of-house and kitchen shifts.</p>
          <div className="mt-5 h-32 rounded-3xl bg-linear-to-r from-blue-50 via-slate-50 to-slate-50 p-4">
            <div className="h-full rounded-3xl bg-white shadow-inner" />
          </div>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Asset Coverage</h3>
          <p className="mt-2 text-slate-600">Track equipment health and planned maintenance for kitchen assets.</p>
          <div className="mt-5 h-32 rounded-3xl bg-linear-to-r from-rose-50 via-slate-50 to-slate-50 p-4">
            <div className="h-full rounded-3xl bg-white shadow-inner" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
          <h3 className="text-lg font-semibold text-slate-900">Operational Pulse</h3>
          <p className="mt-2 text-slate-600">Live tracking for expenses, upgrades, customer costs, and maintenance spend.</p>
          <ul className="mt-4 space-y-2 text-slate-700">
            <li>Expense lines: <strong>{expenses.length}</strong></li>
            <li>Upgrades tracked: <strong>{upgrades.length}</strong></li>
            <li>Assets monitored: <strong>{assets.length}</strong></li>
          </ul>
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
