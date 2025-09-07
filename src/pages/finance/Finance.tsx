import React, { useMemo, useState } from "react";
import { useTms } from "../../store/tms";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const isYMD = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export function Finance() {
  const { ledger, addLedger } = useTms();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [ref, setRef] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return ledger.filter((l) => {
      if (l.type !== "expense") return false;
      if (from && isYMD(from) && new Date(l.ref ?? "") < new Date(from)) return false;
      if (to && isYMD(to) && new Date(l.ref ?? "") > new Date(to)) return false;
      return true;
    });
  }, [ledger, from, to]);

  const total = filtered.reduce((s, x) => s + Number(x.amount || 0), 0);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    addLedger({
      type: "expense",
      amount: Number(amount),
      category,
      note,
      ref: ref && isYMD(ref) ? ref : new Date().toISOString().slice(0, 10),
    });
    setAmount(""); setCategory(""); setNote(""); setRef("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Finance</h1>

      <div className="flex gap-4">
        <label className="text-sm">From
          <input value={from} onChange={(e)=>setFrom(e.target.value)} placeholder="YYYY-MM-DD"
                 className="ml-2 rounded-lg border px-2 py-1"/>
        </label>
        <label className="text-sm">To
          <input value={to} onChange={(e)=>setTo(e.target.value)} placeholder="YYYY-MM-DD"
                 className="ml-2 rounded-lg border px-2 py-1"/>
        </label>
      </div>

      <div className="rounded-2xl border p-5 bg-card">
        <div className="text-sm opacity-70">Expenses (total)</div>
        <div className="text-3xl font-bold">{fmt.format(total)}</div>
      </div>

      <form onSubmit={add} className="flex gap-2 flex-wrap items-end">
        <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)}
               className="rounded-lg border px-2 py-1 w-28"/>
        <input type="text" placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)}
               className="rounded-lg border px-2 py-1 w-32"/>
        <input type="text" placeholder="Note" value={note} onChange={(e)=>setNote(e.target.value)}
               className="rounded-lg border px-2 py-1 w-48"/>
        <input type="text" placeholder="Ref (YYYY-MM-DD)" value={ref} onChange={(e)=>setRef(e.target.value)}
               className="rounded-lg border px-2 py-1 w-40"/>
        <button className="btn btn-primary">Add</button>
      </form>

      <div className="rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-[140px_160px_1fr_1fr_160px] gap-3 px-5 py-3 text-sm font-semibold bg-muted">
          <div>Type</div><div>Amount</div><div>Category</div><div>Note</div><div>Ref</div>
        </div>
        {filtered.map((row) => (
          <div key={row.id} className="grid grid-cols-[140px_160px_1fr_1fr_160px] gap-3 px-5 py-3 border-t text-sm">
            <div><span className="chip">expense</span></div>
            <div>{fmt.format(row.amount)}</div>
            <div>{row.category || "-"}</div>
            <div className="truncate">{row.note || "-"}</div>
            <div className="opacity-70">{row.ref || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
