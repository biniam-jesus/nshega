'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function UpgradesContent() {
  const { upgrades } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Upgrades</h1>
            <p className="mt-2 text-slate-600">Manage project investments, budget, and completion status for restaurant improvements.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">Add Project</button>
        </div>
      </div>

      <div className="space-y-4">
        {upgrades.map((project) => (
          <div key={project.id} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Project</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{project.project_name || 'Unnamed upgrade'}</h2>
                <p className="mt-2 text-sm text-slate-600">{project.description || 'No project description available.'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Budget</p>
                  <p>${Number(project.cost || 0).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Status</p>
                  <p>{project.status || 'Planned'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Started</p>
                  <p>{project.date || 'TBD'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function UpgradesPage() {
  return (
    <DashboardProvider activeTab="upgrades">
      <UpgradesContent />
    </DashboardProvider>
  );
}
