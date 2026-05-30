'use client';

import type { FormEvent } from 'react';
import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function StaffContent() {
  const { employees, attendance, filterDate, setFilterDate, employeeInput, setEmployeeInput } = useDashboard();

  const handleEmployeeAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = (await import('@/lib/supabase')).getSupabase();
    await supabase?.from('employees').insert([employeeInput]);
    setEmployeeInput({ name: '', phone: '', role: '' });
  };

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:grid lg:grid-cols-3 lg:items-start gap-6">
        <div className="lg:col-span-1">
          <h1 className="text-2xl font-semibold text-slate-900">Staff & Attendance</h1>
          <p className="mt-2 text-slate-600">Maintain employee records and review shift check-ins in one place.</p>
        </div>
        <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Staff Member</h2>
          <form onSubmit={handleEmployeeAdd} className="grid gap-4 md:grid-cols-3">
            <input type="text" required value={employeeInput.name} onChange={(e) => setEmployeeInput({ ...employeeInput, name: e.target.value })} placeholder="Employee Name" className="rounded-xl border border-slate-300 px-3 py-2" />
            <input type="text" value={employeeInput.phone} onChange={(e) => setEmployeeInput({ ...employeeInput, phone: e.target.value })} placeholder="Contact Number" className="rounded-xl border border-slate-300 px-3 py-2" />
            <input type="text" required value={employeeInput.role} onChange={(e) => setEmployeeInput({ ...employeeInput, role: e.target.value })} placeholder="Role" className="rounded-xl border border-slate-300 px-3 py-2" />
            <button type="submit" className="md:col-span-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 transition">Create Employee File</button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Employee Directory</h2>
          </div>
          <div className="p-5 space-y-4">
            {employees.map((emp) => (
              <div key={emp.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50">
                <p className="font-semibold text-slate-900">{emp.name}</p>
                <p className="text-sm text-slate-500">{emp.role}</p>
                <p className="text-sm text-slate-500">{emp.phone || 'No contact on file'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Attendance Matrix</h2>
              <p className="text-sm text-slate-500">Filter by date to inspect shift logs.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-xl border border-slate-300 p-2 text-sm" />
              <button type="button" onClick={() => setFilterDate('')} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm">Clear</button>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {attendance.filter((item) => !filterDate || item.date === filterDate).map((att) => (
                <tr key={att.id} className="hover:bg-slate-50/60">
                  <td className="p-4 font-medium">{att.date}</td>
                  <td className="p-4">{att.employees?.name || 'Unknown'}</td>
                  <td className="p-4 text-emerald-600 font-semibold">{att.check_in}</td>
                  <td className="p-4 text-amber-600 font-semibold">{att.check_out || 'On duty'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function StaffPage() {
  return (
    <DashboardProvider activeTab="staff">
      <StaffContent />
    </DashboardProvider>
  );
}
