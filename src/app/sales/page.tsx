'use client';

import DashboardProvider, { useDashboard } from '@/app/components/dashboard/DashboardProvider';

function SalesContent() {
  const { sales, filterDate, setFilterDate, salesInput, setSalesInput, handleAddSales, getSaleDifference, getSaleStatus } = useDashboard();

  return (
    <section className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Daily Sales Tracker</h1>
        <p className="mt-2 text-slate-600">Capture system totals, physical cash, and audit variances in one input flow.</p>
        <form onSubmit={handleAddSales} className="mt-6 grid gap-4 lg:grid-cols-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Date</label>
            <input type="date" required value={salesInput.date} onChange={(e) => setSalesInput({ ...salesInput, date: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">System Sales ($)</label>
            <input type="number" step="0.01" required value={salesInput.system_sales} onChange={(e) => setSalesInput({ ...salesInput, system_sales: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Actual Cash ($)</label>
            <input type="number" step="0.01" required value={salesInput.actual_cash} onChange={(e) => setSalesInput({ ...salesInput, actual_cash: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 transition">Add Sale</button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Sales Audit Ledger</h2>
            <p className="text-sm text-slate-500">Review system vs actual performance with discrepancy status.</p>
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
              <th className="p-4">System Sales</th>
              <th className="p-4">Actual Cash</th>
              <th className="p-4">Variance</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sales.filter((item) => !filterDate || item.date === filterDate).map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/60">
                <td className="p-4 font-medium">{sale.date}</td>
                <td className="p-4">${(Number(sale.system_sales) || 0).toFixed(2)}</td>
                <td className="p-4">${(Number(sale.actual_cash) || 0).toFixed(2)}</td>
                <td className={`p-4 font-semibold ${getSaleDifference(sale) < 0 ? 'text-red-600' : getSaleDifference(sale) > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                  ${getSaleDifference(sale).toFixed(2)}
                </td>
                <td className="p-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSaleStatus(sale) === 'Match' ? 'bg-emerald-100 text-emerald-800' : getSaleStatus(sale) === 'Shortage' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {getSaleStatus(sale)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SalesPage() {
  return (
    <DashboardProvider activeTab="sales">
      <SalesContent />
    </DashboardProvider>
  );
}
