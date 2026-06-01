"use client";
import DashboardProvider, {
  useDashboard,
} from "@/app/components/dashboard/DashboardProvider";

const CATEGORIES = [
  "consumable",
  "drinks",
  "asset",
  "maintenance",
  "general expense",
];
const PAYMENT_METHODS = ["cash", "bank", "mobile money"];

function PurchasesContent() {
  const {
    purchases,
    purchasesInput,
    setPurchasesInput,
    suppliers,
    handleAddPurchase,
    filterDate,
    setFilterDate,
    totalPurchases,
    categoryPurchases,
    supplierPurchases,
    monthlyPurchases,
  } = useDashboard();

  const filteredPurchases = purchases.filter(
    (p) => !filterDate || p.purchase_date === filterDate,
  );

  return (
    <section className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Total Purchases
          </p>
          <p className="mt-4 text-3xl font-bold text-rose-700">
            ${totalPurchases.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-slate-600">All time spending</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            This Month
          </p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            ${monthlyPurchases.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-slate-600">Current month spending</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Categories
          </p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {CATEGORIES.length}
          </p>
          <p className="mt-2 text-sm text-slate-600">Purchase categories</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Suppliers
          </p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {supplierPurchases.length}
          </p>
          <p className="mt-2 text-sm text-slate-600">Active suppliers</p>
        </div>
      </div>

      {/* Add Purchase Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Record New Purchase
        </h2>
        <p className="mt-2 text-slate-600">
          Track items bought and cash used for purchasing.
        </p>

        <form
          onSubmit={handleAddPurchase}
          className="mt-6 grid gap-4 xl:grid-cols-5 items-end"
        >
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={purchasesInput.item_name}
              onChange={(e) =>
                setPurchasesInput({
                  ...purchasesInput,
                  item_name: e.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="e.g., Coffee Beans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Category *
            </label>
            <select
              required
              value={purchasesInput.category}
              onChange={(e) =>
                setPurchasesInput({
                  ...purchasesInput,
                  category: e.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Quantity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={purchasesInput.quantity}
              onChange={(e) => {
                const qty = e.target.value;
                const unit = Number(purchasesInput.unit_price) || 0;
                setPurchasesInput({
                  ...purchasesInput,
                  quantity: qty,
                  total_price: (Number(qty) * unit).toFixed(2),
                  cash_used: (Number(qty) * unit).toFixed(2),
                });
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Unit Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={purchasesInput.unit_price}
              onChange={(e) => {
                const unit = e.target.value;
                const qty = Number(purchasesInput.quantity) || 1;
                setPurchasesInput({
                  ...purchasesInput,
                  unit_price: unit,
                  total_price: (Number(unit) * qty).toFixed(2),
                  cash_used: (Number(unit) * qty).toFixed(2),
                });
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Total Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={purchasesInput.total_price}
              readOnly
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">Supplier *</label>
            <select
              required
              value={purchasesInput.supplier_id}
              onChange={(e) => {
                const selected = suppliers.find(s => s.id === e.target.value);
                setPurchasesInput({
                  ...purchasesInput,
                  supplier_id: e.target.value,
                  supplier_name: selected?.name || ""
                });
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Payment Method *
            </label>
            <select
              required
              value={purchasesInput.payment_method}
              onChange={(e) =>
                setPurchasesInput({
                  ...purchasesInput,
                  payment_method: e.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
            >
              <option value="">Select method</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Cash Used ($) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={purchasesInput.cash_used}
              onChange={(e) =>
                setPurchasesInput({
                  ...purchasesInput,
                  cash_used: e.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Purchase Date *
            </label>
            <input
              type="date"
              required
              value={purchasesInput.purchase_date}
              onChange={(e) =>
                setPurchasesInput({
                  ...purchasesInput,
                  purchase_date: e.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Notes
            </label>
            <input
              type="text"
              value={purchasesInput.notes}
              onChange={(e) =>
                setPurchasesInput({ ...purchasesInput, notes: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Optional notes"
            />
          </div>

          <button
            type="submit"
            className="xl:col-span-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 transition"
          >
            Record Purchase
          </button>
        </form>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Category Breakdown
          </h3>
          <div className="mt-4 space-y-3">
            {categoryPurchases.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {cat.category}
                </span>
                <span className="text-sm font-semibold text-rose-600">
                  ${cat.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Top Suppliers
          </h3>
          <div className="mt-4 space-y-3">
            {supplierPurchases.slice(0, 5).map((sup, idx) => (
              <div
                key={sup.supplier_name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {sup.supplier_name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ${sup.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Purchase Ledger
            </h2>
            <p className="text-sm text-slate-500">
              Track all items bought and cash spent.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-xl border border-slate-300 p-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setFilterDate("")}
              className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Unit Price</th>
              <th className="p-4">Total</th>
              <th className="p-4">Cash Used</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-500">
                  No purchases found. Record your first purchase above.
                </td>
              </tr>
            ) : (
              filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50/60">
                  <td className="p-4 font-medium">{purchase.purchase_date}</td>
                  <td className="p-4">{purchase.item_name}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize">
                      {purchase.category}
                    </span>
                  </td>
                  <td className="p-4">{purchase.quantity}</td>
                  <td className="p-4 text-slate-600">
                    ${Number(purchase.unit_price).toFixed(2)}
                  </td>
                  <td className="p-4 font-semibold">
                    ${Number(purchase.total_price).toFixed(2)}
                  </td>
                  <td className="p-4 text-rose-600 font-semibold">
                    -${Number(purchase.cash_used).toFixed(2)}
                  </td>
                  <td className="p-4 capitalize">{purchase.payment_method}</td>
                  <td className="p-4 text-slate-600">
                    {purchase.supplier_name}
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {purchase.notes || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function PurchasesPage() {
  return (
    <DashboardProvider activeTab="purchases">
      <PurchasesContent />
    </DashboardProvider>
  );
}
