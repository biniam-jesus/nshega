'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function MaintenanceContent() {
  const { maintenance, filterDate, setFilterDate } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Maintenance</h1>
            <p className="mt-2 text-slate-600">Review repair records, track upcoming service needs, and keep equipment uptime high.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">Schedule Repair</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Repair Records</h2>
            <p className="text-sm text-slate-500">Filter by service date to find upcoming maintenance tasks.</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-2xl border border-slate-300 p-2 text-sm" />
            <button type="button" onClick={() => setFilterDate('')} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Clear</button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {maintenance.filter((item) => !filterDate || item.date === filterDate).map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{item.item || 'Maintenance task'}</p>
                  <p className="text-sm text-slate-500">Technician: {item.technician || 'Internal team'}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">Upcoming</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-white p-3 border border-slate-200">
                  <p className="font-semibold text-slate-900">Cost</p>
                  <p>${Number(item.cost || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 border border-slate-200">
                  <p className="font-semibold text-slate-900">Date</p>
                  <p>{item.date || 'TBD'}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 border border-slate-200">
                  <p className="font-semibold text-slate-900">Status</p>
                  <p>{item.status || 'Scheduled'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MaintenancePage() {
  return (
    <DashboardProvider activeTab="maintenance">
      <MaintenanceContent />
    </DashboardProvider>
  );
}
