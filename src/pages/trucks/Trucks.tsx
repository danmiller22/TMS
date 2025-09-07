import { useState } from "react";
import { motion } from "framer-motion";
import { useTms, Truck } from "../../store/tms";

function TruckEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: Truck;
  onSave: (t: Truck) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Truck>(initial);
  const canSave = form.id.trim().length > 0;

  const save = () => canSave && onSave(form);

  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <h2 className="text-lg font-semibold mb-3">{initial.id ? `Edit ${initial.id}` : "New truck"}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">ID
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={form.id} onChange={(e)=>setForm({...form, id:e.target.value})}
                 onKeyDown={(e)=> e.key==='Enter' && save()} />
        </label>
        <label className="text-sm">VIN
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={form.vin} onChange={(e)=>setForm({...form, vin:e.target.value})}
                 onKeyDown={(e)=> e.key==='Enter' && save()} />
        </label>
        <label className="text-sm">Make
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={form.make || ""} onChange={(e)=>setForm({...form, make:e.target.value})}
                 onKeyDown={(e)=> e.key==='Enter' && save()} />
        </label>
        <label className="text-sm">Odo
          <input type="number" className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background"
                 value={form.odo ?? 0} onChange={(e)=>setForm({...form, odo:Number(e.target.value)})}
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

export default function Trucks() {
  const { trucks, upsertTruck, removeTruck } = useTms();
  const [editing, setEditing] = useState<Truck | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trucks</h1>
        <button className="btn btn-primary" onClick={()=>setEditing({ id: "", vin: "", make: "", odo: 0 })}>Add</button>
      </div>

      {editing && (
        <TruckEditor
          initial={editing}
          onSave={(t)=>{ upsertTruck(t); setEditing(null); }}
          onCancel={()=>setEditing(null)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {trucks.map((t) => (
          <motion.div key={t.id} layout className="glass rounded-2xl p-4 border border-border"
            initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
            <div className="font-semibold">{t.id} • {t.make || "-"}</div>
            <div className="opacity-70 text-sm">VIN {t.vin}</div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-ghost" onClick={()=>setEditing(t)}>Edit</button>
              <button className="btn bg-red-500/90 hover:bg-red-500 text-white" onClick={()=>removeTruck(t.id)}>Delete</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export { Trucks };
