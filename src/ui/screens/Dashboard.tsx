// src/ui/screens/Dashboard.tsx
import { useMemo } from "react";
import { useTms } from "../../store/tms";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const CURRENCY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const fmtY = (v: number) => CURRENCY.format(v || 0);

export function Dashboard() {
  const { trucks, trailers, cases, ledger } = useTms();

  const expenses = ledger.filter(l => l.type === "expense").reduce((s,x)=>s+Number(x.amount||0),0);

  const lineData = useMemo(() => {
    const map = new Map<string, number>();
    ledger.filter(l=>l.type==="expense").forEach(l=>{
      const key = l.ref || new Date().toISOString().slice(0,10);
      map.set(key, (map.get(key)||0) + Number(l.amount||0));
    });
    return Array.from(map.entries())
      .map(([date, amount])=>({ date, amount }))
      .sort((a,b)=>a.date.localeCompare(b.date));
  }, [ledger]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5 border border-border">
          <div className="text-sm opacity-70">Active trucks</div>
          <div className="text-3xl font-bold">{trucks.length}</div>
        </div>
        <div className="glass rounded-2xl p-5 border border-border">
          <div className="text-sm opacity-70">Trailers</div>
          <div className="text-3xl font-bold">{trailers.length}</div>
        </div>
        <div className="glass rounded-2xl p-5 border border-border">
          <div className="text-sm opacity-70">Open cases</div>
          <div className="text-3xl font-bold">{cases.filter(c=>c.stage!=="Closed").length}</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border border-border">
        <div className="text-sm opacity-70">Expenses (total)</div>
        <div className="text-3xl font-bold">{fmtY(expenses)}</div>

        <div className="h-40 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtY as any} />
              <Tooltip formatter={(v: number)=>fmtY(v)} labelFormatter={(l)=>`Date: ${l}`} />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
