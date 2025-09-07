import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTms, CASE_STAGES, CaseItem, InvoiceFile } from "../../store/tms";

const fmt = (ts: string) =>
  new Date(ts).toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

function NewCaseForm({ onAdd }: { onAdd: (c: Omit<CaseItem, "openedAt" | "timeline" | "invoice">) => void }) {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [assetId, setAssetId] = useState("");
  const [sev, setSev] = useState<"Low" | "Medium" | "High">("Medium");

  const can = id.trim() && title.trim();

  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-sm">ID
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={id} onChange={(e)=>setId(e.target.value)} />
        </label>
        <label className="text-sm md:col-span-2">Title
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={title} onChange={(e)=>setTitle(e.target.value)} />
        </label>
        <label className="text-sm">Asset
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 placeholder="(optional)" value={assetId} onChange={(e)=>setAssetId(e.target.value)} />
        </label>
        <label className="text-sm">Severity
          <select className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                  value={sev} onChange={(e)=>setSev(e.target.value as any)}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary disabled:opacity-50" disabled={!can}
          onClick={()=> can && onAdd({ id, title, assetId, severity: sev, stage: "New" })}>
          Create
        </button>
      </div>
    </div>
  );
}

function CaseCard({ c, onAdvance, onNote, onUpload }: {
  c: CaseItem;
  onAdvance: (id: string) => void;
  onNote: (id: string, text: string) => void;
  onUpload: (id: string, file: InvoiceFile) => void;
}) {
  const [note, setNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const inv: InvoiceFile = { name: f.name, mime: f.type, size: f.size, dataUrl: reader.result as string };
      onUpload(c.id, inv);
    };
    reader.readAsDataURL(f);
  };

  const idx = CASE_STAGES.indexOf(c.stage as any);
  const canNext = idx < CASE_STAGES.length - 1;

  return (
    <motion.div layout initial={{opacity:0, y:8}} animate={{opacity:1, y:0}}
      className="glass rounded-2xl p-4 border border-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">
            {c.title} • <span className="opacity-70">{c.id}</span>
          </div>
          <div className="text-sm opacity-70">Stage: {c.stage} • Opened {fmt(c.openedAt)}</div>
          {c.assetId && <div className="text-sm opacity-70">Asset: {c.assetId}</div>}
        </div>
        <span className={`chip ${c.severity === "High" ? "bg-red-500/15" : c.severity === "Low" ? "bg-green-500/15" : ""}`}>
          {c.severity}
        </span>
      </div>

      {/* upload invoice */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm opacity-70">Upload invoice</span>
        <button className="btn btn-ghost" onClick={pickFile}>Choose File</button>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
        <div className="text-sm opacity-70">
          {c.invoice ? c.invoice.name : "No file chosen"}
        </div>
        {c.invoice && (
          <a className="ml-auto underline text-sm" href={c.invoice.dataUrl} target="_blank">Open</a>
        )}
      </div>

      {/* timeline */}
      <div className="mt-3 max-h-40 overflow-auto rounded-xl border border-border bg-background px-3 py-2">
        {c.timeline.slice().reverse().map((t, i) => (
          <div key={i} className="text-sm flex items-center justify-between border-b last:border-0 border-border/50 py-1">
            <div>• {t.text}</div>
            <div className="opacity-60">{fmt(t.ts)}</div>
          </div>
        ))}
      </div>

      {/* add note + next */}
      <div className="mt-3 flex items-center gap-2">
        <input className="flex-1 rounded-xl border border-border bg-background px-3 py-2"
               placeholder="Add note…" value={note}
               onChange={(e)=>setNote(e.target.value)}
               onKeyDown={(e)=>{ if(e.key==='Enter' && note.trim()){ onNote(c.id, note.trim()); setNote(""); } }} />
        <button className="btn btn-ghost" onClick={()=>{ if(note.trim()){ onNote(c.id, note.trim()); setNote(""); }}}>Add</button>
        <button className="btn btn-primary disabled:opacity-50" disabled={!canNext} onClick={()=>onAdvance(c.id)}>
          Next
        </button>
      </div>
    </motion.div>
  );
}

export function Cases() {
  const { cases, addCase, advanceCase, addCaseNote, attachInvoice } = useTms();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return cases;
    const norm = (s?: string) => (s || "").toLowerCase();
    return cases.filter((c) =>
      [c.id, c.title, c.assetId].some((x) => norm(x as string).includes(n))
    );
  }, [cases, q]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cases</h1>

      {/* quick search */}
      <div className="flex items-center gap-2">
        <input className="rounded-2xl border border-border bg-background px-3 py-2 w-[280px]"
               placeholder="Search by id/title/asset…" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>

      {/* form */}
      <NewCaseForm onAdd={addCase} />

      {/* list */}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((c) => (
          <CaseCard key={c.id}
            c={c}
            onAdvance={advanceCase}
            onNote={addCaseNote}
            onUpload={attachInvoice}
          />
        ))}
        {list.length === 0 && (
          <div className="opacity-70">No cases yet.</div>
        )}
      </div>
    </div>
  );
}
