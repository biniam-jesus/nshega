'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function SettingsContent() {
  const { totalSales, totalDirectExpenses, netProfit } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
            <p className="mt-2 text-slate-600">Configure Shega Café preferences, notifications, and integrations.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Save Changes</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Account</h2>
          <p className="mt-3 text-slate-600">Update your profile, default business settings, and access controls.</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Integrations</h2>
          <p className="mt-3 text-slate-600">Connect POS, payments, and reporting systems with Shega Café.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Business Snapshot</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
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

export default function SettingsPage() {
  return (
    <DashboardProvider activeTab="settings">
      <SettingsContent />
    </DashboardProvider>
  );
}
