'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function DrinksInventoryContent() {
  const { drinks } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Drinks Inventory</h1>
            <p className="mt-2 text-slate-600">Visual inventory cards for beverages, with low-stock alerts and usage status.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">Reorder Beverages</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {drinks.map((drink) => (
          <div key={drink.id} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{drink.name}</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">{drink.quantity}</h2>
                <p className="mt-1 text-sm text-slate-500">Units in stock</p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${drink.quantity <= 15 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-700'}`}>
                {drink.quantity <= 15 ? 'Low' : 'Healthy'}
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Daily Sell</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{drink.sold_per_day || 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Restock</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{drink.restock_level || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DrinksInventoryPage() {
  return (
    <DashboardProvider activeTab="drinks">
      <DrinksInventoryContent />
    </DashboardProvider>
  );
}
