import { useState } from "react";
import { useTms, Trailer } from "../../store/tms";
import { motion } from "framer-motion";

function TrailerEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: Trailer;
  onSave: (t: Trailer) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Trailer>(initial);
  const canSave = form.id.trim().length > 0;
  const save = () => canSave && onSave(form);

  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <h2 className="text-lg font-semibold mb-3">{initial.id ? `Edit ${initial.id}` : "New trailer"}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">ID
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={form.id} onChange={(e)=>setForm({...form, id:e.target.value})}
                 onKeyDown={(e)=> e.key==='Enter' && save()} />
        </label>
        <label className="text-sm">Owner
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={form.owner || ""} onChange={(e)=>setForm({...form, owner:e.target.value})}
                 onKeyDown={(e)=> e.key==='Enter' && save()} />
        </label>
        <label className="text-sm">Ext
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={form.extCode || ""} onChange={(e)=>setForm({...form, extCode:e.target.value})}
                 onKeyDown={(e)=> e.key==='Enter' && save()} />
        </label>
        <label className="text-sm">Type
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={form.type || ""} onChange={(e)=>setForm({...form, type:e.target.value})}
                 onKeyDown={(e)=> e.key==='Enter' && save()} />
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary disabled:opacity-50" onClick={save} disabled={!canSave}>Save</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function Trailers() {
  const { trailers, upsertTrailer, removeTrailer } = useTms();
  const [editing, setEditing] = useState<Trailer | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trailers</h1>
        <button className="btn btn-primary" onClick={()=>setEditing({ id:"", owner:"", extCode:"", type:"Dry Van", status:"Ready" })}>
          Add
        </button>
      </div>

      {editing && (
        <TrailerEditor
          initial={editing}
          onSave={(t)=>{ upsertTrailer(t); setEditing(null); }}
          onCancel={()=>setEditing(null)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {trailers.map((t) => (
          <motion.div key={t.id} layout className="glass rounded-2xl p-4 border border-border"
            initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{t.id} • {t.type ?? "Dry Van"}</div>
                <div className="opacity-70 text-sm">Owner {t.owner || "-"} • Ext {t.extCode || "-"}</div>
              </div>
              <span className="chip">{t.status || "Ready"}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-ghost" onClick={()=>setEditing(t)}>Edit</button>
              <button className="btn bg-red-500/90 hover:bg-red-500 text-white" onClick={()=>removeTrailer(t.id)}>Delete</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export { Trailers };
