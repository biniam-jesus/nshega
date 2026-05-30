'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function InventoryContent() {
  const { assets, consumables, drinks } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Inventory Matrix</h1>
        <p className="mt-2 text-slate-600">Monitor consumables, beverage reserves, and fixed assets side by side.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 font-semibold text-slate-900">Consumables Dashboard</div>
          <div className="p-5 space-y-4">
            {consumables.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Restock at {item.restock_level || 'N/A'}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${item.quantity <= item.restock_level ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {item.quantity} units
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-emerald-50 border-b border-slate-200 font-semibold text-emerald-900">Beverage Reserves</div>
          <div className="p-5 space-y-4">
            {drinks.map((drink) => (
              <div key={drink.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-900">{drink.name}</p>
                  <p className="text-xs text-slate-500">Daily burn: {drink.sold_per_day || 0}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${drink.quantity <= 15 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                  {drink.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-slate-900 border-b border-slate-200 font-semibold text-white">Asset Portfolio</div>
          <div className="p-5 space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                <p className="font-semibold text-slate-900">{asset.name}</p>
                <p className="text-xs text-slate-500">Purchased: {asset.purchase_date}</p>
                <p className="text-xs text-slate-500">Condition: {asset.condition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function InventoryPage() {
  return (
    <DashboardProvider activeTab="inventory">
      <InventoryContent />
    </DashboardProvider>
  );
}
