// src/ui/screens/Trucks.tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTms, Truck } from "../../store/tms";

const inputCls =
  "mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background text-foreground " +
  "placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-white/10";

function TruckEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: Truck;
  onSave: (t: Truck) => void;
  onCancel: () => void;
}) {
  const [id, setId] = useState(initial.id || "");
  const canSave = id.trim().length > 0;
  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <h2 className="text-lg font-semibold mb-3">{initial.id ? `Edit ${initial.id}` : "New truck"}</h2>
      <label className="text-sm">
        Unit #
        <input
          className={inputCls}
          placeholder="e.g. 4521"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSave && onSave({ id: id.trim() })}
        />
      </label>

      <div className="mt-4 flex gap-2">
        <button
          className="btn btn-primary disabled:opacity-50"
          onClick={() => onSave({ id: id.trim() })}
          disabled={!canSave}
        >
          Save
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Trucks() {
  const { trucks, upsertTruck, removeTruck, upsertManyTrucks } = useTms();
  const [editing, setEditing] = useState<Truck | null>(null);
  const [syncing, setSyncing] = useState(false);
  const didInit = useRef(false);

  async function syncFromSamsara(silent = false) {
    try {
      setSyncing(true);
      const res = await fetch("http://localhost:7070/api/samsara/sync");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (Array.isArray(data.trucks)) upsertManyTrucks(data.trucks);
      if (!silent) alert(`Synced ${data.trucks?.length ?? 0} trucks`);
    } catch (e: any) {
      if (!silent) alert("Sync error: " + (e?.message || e));
    } finally {
      setSyncing(false);
    }
  }

  // Автосинк при заходе (один раз)
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (trucks.length === 0) syncFromSamsara(true);
  }, [trucks.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trucks</h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => syncFromSamsara()} disabled={syncing}>
            {syncing ? "Syncing…" : "Sync from Samsara"}
          </button>
          <button className="btn btn-primary" onClick={() => setEditing({ id: "" })}>
            Add
          </button>
        </div>
      </div>

      {editing && (
        <TruckEditor
          initial={editing}
          onSave={(t) => {
            upsertTruck(t);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Компактная сетка для сотен юнитов */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {trucks.map((t) => (
          <motion.div
            key={t.id}
            layout
            className="glass rounded-xl p-3 border border-border"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="text-base font-semibold">#{t.id}</div>
            <div className="text-xs opacity-70 mt-1">{t.vin ? `VIN ${t.vin}` : "VIN —"}</div>
            <div className="text-xs opacity-70">{t.odo != null ? `ODO ${t.odo}` : "ODO —"}</div>
            <div className="text-xs opacity-70">{t.status || "Status —"}</div>
            <div className="text-xs opacity-70">{t.location ? `Location ${t.location}` : "Location —"}</div>
            <div className="text-xs opacity-70">
              {t.lastSeen ? `Updated ${new Date(t.lastSeen).toLocaleString()}` : ""}
            </div>

            <div className="mt-3 flex gap-2">
              <button className="btn btn-ghost px-3 py-1.5 text-sm" onClick={() => setEditing({ id: t.id })}>
                Edit
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-xl bg-red-500/90 hover:bg-red-500 text-white"
                onClick={() => removeTruck(t.id)}
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export { Trucks };
