'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function AttendanceContent() {
  const { attendance, filterDate, setFilterDate, employees } = useDashboard();
  const onDuty = attendance.filter((record) => record.check_in && !record.check_out).length;

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
            <p className="mt-2 text-slate-600">Visualize hourly shifts, on-duty staff, and monthly attendance patterns.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Sync with Shift Logs</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Team Size</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{employees.length}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">On Duty</p>
          <p className="mt-3 text-3xl font-bold text-emerald-800">{onDuty}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Recent Check-Ins</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{attendance.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Monthly Attendance Overview</h2>
            <p className="mt-1 text-sm text-slate-500">Color-coded records make shift auditing fast.</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-2xl border border-slate-300 p-2 text-sm" />
            <button type="button" onClick={() => setFilterDate('')} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Clear</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {attendance.filter((record) => !filterDate || record.date === filterDate).map((record) => (
            <div key={record.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{record.employees?.name || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">{record.date}</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${record.check_out ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {record.check_out ? 'Completed' : 'Active'}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-3 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Check In</p>
                  <p className="mt-2 text-sm text-slate-900">{record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Check Out</p>
                  <p className="mt-2 text-sm text-slate-900">{record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'On shift'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AttendancePage() {
  return (
    <DashboardProvider activeTab="attendance">
      <AttendanceContent />
    </DashboardProvider>
  );
}
