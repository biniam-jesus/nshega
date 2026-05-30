'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function OperationsContent() {
  const { customerExp, upgrades, maintenance, filterDate, setFilterDate } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Operations & Upgrades</h1>
        <p className="mt-2 text-slate-600">Review client adjustments, capital upgrades and maintenance cycle spending.</p>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-rose-50 border-b border-slate-200 font-semibold text-rose-900">Customer Expense Adjustments</div>
          <div className="p-5 space-y-4">
            {customerExp.filter((item) => !filterDate || item.date === filterDate).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{entry.reason}</p>
                  <span className="text-sm font-semibold text-rose-700">-${Number(entry.amount).toFixed(2)}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Ref: {entry.order_reference || 'Manual adjustment'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-blue-50 border-b border-slate-200 font-semibold text-blue-900">Infrastructure Upgrades</div>
          <div className="p-5 space-y-4">
            {upgrades.filter((item) => !filterDate || item.date === filterDate).map((upgrade) => (
              <div key={upgrade.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{upgrade.project_name}</p>
                  <span className="text-sm font-semibold text-blue-700">-${Number(upgrade.cost).toFixed(2)}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{upgrade.description || 'Upgrade investment'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-amber-50">
          <div>
            <h2 className="text-lg font-semibold text-amber-900">Maintenance Activity</h2>
            <p className="text-sm text-slate-500">Filter by date for repair and servicing costs.</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-xl border border-slate-300 p-2 text-sm" />
            <button type="button" onClick={() => setFilterDate('')} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm">Clear</button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {maintenance.filter((item) => !filterDate || item.date === filterDate).map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{item.item}</p>
                <span className="text-sm font-semibold text-amber-700">-${Number(item.cost).toFixed(2)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Technician: {item.technician || 'Internal'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function OperationsPage() {
  return (
    <DashboardProvider activeTab="operations">
      <OperationsContent />
    </DashboardProvider>
  );
}
