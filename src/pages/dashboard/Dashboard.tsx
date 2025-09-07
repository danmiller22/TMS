import { useTms } from "../../store/tms";

export function Dashboard() {
  const { trucks, trailers, cases, ledger } = useTms();
  const expenses = ledger.filter(l => l.type === "expense").reduce((s,x)=>s+x.amount,0);

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
        <div className="text-3xl font-bold">${expenses.toFixed(2)}</div>
      </div>

      <div className="text-center text-base font-bold mt-8">
        ‘It’s our duty to lead people to the light’<br/>by Dan Miller
      </div>
    </div>
  );
}
