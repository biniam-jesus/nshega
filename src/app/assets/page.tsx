'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function AssetsContent() {
  const { assets } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Assets</h1>
            <p className="mt-2 text-slate-600">Track equipment, kitchen technology, and furniture with maintenance and condition details.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Add Asset</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xl font-semibold text-slate-900">{asset.name}</p>
                <p className="mt-1 text-sm text-slate-500">{asset.condition || 'Condition unavailable'}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">{asset.maintenance_status || 'Stable'}</span>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p>Cost: ${Number(asset.cost || 0).toFixed(2)}</p>
              <p>Purchased: {asset.purchase_date || 'Unknown'}</p>
              <p>Condition: {asset.condition || 'Unknown'}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AssetsPage() {
  return (
    <DashboardProvider activeTab="assets">
      <AssetsContent />
    </DashboardProvider>
  );
}
