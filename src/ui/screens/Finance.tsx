// src/ui/screens/Finance.tsx
import React, { useState } from "react";
import useTms, { LedgerEntry } from "../../store/tms";

const Finance: React.FC = () => {
  const { ledger, addLedger } = useTms();
  const [f, setF] = useState<LedgerEntry>({
    id: "",
    date: new Date().toISOString().slice(0, 10),
    kind: "Expense",
    amount: 0,
    currency: "USD",
    note: "",
  });

  const add = () => {
    if (!f.id) return;
    addLedger({ ...f, date: new Date(f.date).toISOString() });
    setF({ ...f, id: "", amount: 0, note: "" });
  };

  const total = ledger.reduce((s, x) => s + (x.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Finance</h1>

      <div className="grid md:grid-cols-6 gap-2">
        <input className="input" placeholder="ID" value={f.id} onChange={e => setF({ ...f, id: e.target.value })} />
        <input className="input" type="date" value={f.date.slice(0,10)} onChange={e => setF({ ...f, date: e.target.value })} />
        <input className="input" placeholder="Type" value={f.kind ?? ""} onChange={e => setF({ ...f, kind: e.target.value })} />
        <input className="input" type="number" placeholder="Amount" value={f.amount} onChange={e => setF({ ...f, amount: Number(e.target.value) })} />
        <input className="input" placeholder="Currency" value={f.currency ?? ""} onChange={e => setF({ ...f, currency: e.target.value })} />
        <input className="input md:col-span-2" placeholder="Note" value={f.note ?? ""} onChange={e => setF({ ...f, note: e.target.value })} />
        <button className="btn btn-primary" onClick={add}>Add</button>
      </div>

      <div className="text-sm opacity-70">Total: {total.toFixed(2)} {f.currency}</div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Currency</th>
              <th className="py-2 pr-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((x) => (
              <tr key={x.id} className="border-b last:border-0">
                <td className="py-2 pr-4">{x.id}</td>
                <td className="py-2 pr-4">{x.date.slice(0,10)}</td>
                <td className="py-2 pr-4">{x.kind ?? "-"}</td>
                <td className="py-2 pr-4">{x.amount}</td>
                <td className="py-2 pr-4">{x.currency ?? "-"}</td>
                <td className="py-2 pr-4">{x.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Finance };
export default Finance;
