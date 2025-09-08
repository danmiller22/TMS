// src/ui/screens/Trucks.tsx
import React, { useMemo, useState } from "react";
import useTms, { Truck } from "../../store/tms";
import { syncSamsara } from "../../lib/samsara";

function fmtOdo(m?: number | null, units: "imperial" | "metric" = "imperial") {
  if (m == null) return "-";
  return units === "imperial" ? `${(m / 1609.344).toFixed(1)} mi` : `${(m / 1000).toFixed(1)} km`;
}

const Trucks: React.FC = () => {
  const { trucks, upsertTruck, removeTruck, upsertManyTrucks, settings } = useTms();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Truck | null>(null);
  const units = settings?.units ?? "imperial";

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return trucks;
    return trucks.filter((t) =>
      [t.id, t.vin ?? "", t.plate ?? "", t.make ?? "", t.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(n)
    );
  }, [trucks, q]);

  async function syncFromSamsara() {
    try {
      const idSource = settings?.samsaraIdSource ?? "name";
      const data = await syncSamsara(idSource);
      upsertManyTrucks(data.trucks || []);
      alert(`Synced ${data.trucks?.length ?? 0} trucks`);
    } catch (e: any) {
      alert(`Sync error: ${e?.message || e}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Trucks</h1>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-primary" onClick={syncFromSamsara}>
            Sync from Samsara
          </button>
          <button className="btn" onClick={() => setEdit({ id: "", vin: "", make: "", odo: 0 })}>
            Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-3">
        {list.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-xl border bg-white shadow flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">
                {t.id} • {t.make ?? "-"}
              </div>
              <div className="text-sm opacity-70">
                VIN: {t.vin ?? "-"} • Plate: {t.plate ?? "-"} • Odo: {fmtOdo(t.odo, units)}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => setEdit(t)}>
                Edit
              </button>
              <button className="btn" onClick={() => removeTruck(t.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add block */}
      {edit && (
        <div className="p-4 rounded-xl border bg-white shadow space-y-2">
          <div className="grid md:grid-cols-5 gap-2">
            <input
              className="input"
              placeholder="ID"
              value={edit.id}
              onChange={(e) => setEdit({ ...edit, id: e.target.value })}
            />
            <input
              className="input"
              placeholder="VIN"
              value={edit.vin ?? ""}
              onChange={(e) => setEdit({ ...edit, vin: e.target.value })}
            />
            <input
              className="input"
              placeholder="Make"
              value={edit.make ?? ""}
              onChange={(e) => setEdit({ ...edit, make: e.target.value })}
            />
            <input
              className="input"
              placeholder="Plate"
              value={edit.plate ?? ""}
              onChange={(e) => setEdit({ ...edit, plate: e.target.value })}
            />
            <input
              className="input"
              type="number"
              placeholder="Odometer (meters)"
              value={edit.odo ?? 0}
              onChange={(e) => setEdit({ ...edit, odo: Number(e.target.value) })}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                upsertTruck(edit);
                setEdit(null);
              }}
            >
              Save
            </button>
            <button className="btn" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { Trucks };
export default Trucks;
