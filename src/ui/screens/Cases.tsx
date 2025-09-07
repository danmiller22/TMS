// src/ui/screens/Cases.tsx
import React, { useMemo, useState } from "react";
import useTms, { CASE_STAGES, CaseItem, CaseStage, Urgency } from "../../store/tms";

const Cases: React.FC = () => {
  const { cases, addCase, setCaseStage, addCaseNote, updateCase } = useTms();
  const [q, setQ] = useState("");
  const [form, setForm] = useState<{ id: string; title: string; assetId?: string; severity?: Urgency; until?: string }>({
    id: "",
    title: "",
    assetId: "",
    severity: "Low",
    until: "",
  });

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return cases;
    return cases.filter(c =>
      [c.id, c.title, c.assetId ?? "", c.severity ?? "", c.stage, c.until ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(n)
    );
  }, [cases, q]);

  const create = () => {
    if (!form.id || !form.title) return;
    addCase({
      id: form.id,
      title: form.title,
      assetId: form.assetId,
      severity: form.severity,
      until: form.until,
    });
    setForm({ id: "", title: "", assetId: "", severity: "Low", until: "" });
  };

  const nextStage = (c: CaseItem): CaseStage => {
    const i = CASE_STAGES.indexOf(c.stage);
    return CASE_STAGES[Math.min(i + 1, CASE_STAGES.length - 1)];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Cases</h1>

      {/* Add form */}
      <div className="grid md:grid-cols-5 gap-2">
        <input className="input" placeholder="Case ID" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
        <input className="input md:col-span-2" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input className="input" placeholder="Asset ID" value={form.assetId ?? ""} onChange={e => setForm({ ...form, assetId: e.target.value })} />
        <select className="input" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value as Urgency })}>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option><option>Urgent</option>
        </select>
        <input className="input" type="date" value={form.until ?? ""} onChange={e => setForm({ ...form, until: e.target.value })} />
        <button className="btn btn-primary md:col-span-2" onClick={create}>Add case</button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="Search cases…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {list.map(c => (
          <div key={c.id} className="p-4 rounded-xl border bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="font-semibold">{c.id} • {c.title}</div>
              <div className="text-sm opacity-70">
                Stage: {c.stage} • Severity: {c.severity ?? "-"} • Asset: {c.assetId ?? "-"} {c.until ? `• Until: ${c.until}` : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => setCaseStage(c.id, nextStage(c))}>Advance</button>
              <button className="btn" onClick={() => addCaseNote(c.id, "Checked")}>+Note</button>
              <button className="btn" onClick={() => updateCase(c.id, { severity: "High" })}>Mark High</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Cases };
export default Cases;
