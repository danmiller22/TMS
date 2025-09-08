// src/pages/trucks/TrucksPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import useTms, { Truck } from "../../store/tms";
import { syncSamsara } from "../../lib/samsara";
import {
  listTrucks,
  upsertTrucks as dbUpsertTrucks,
  upsertTruck as dbUpsertTruck,
  deleteTruck as dbDeleteTruck,
} from "../../services/db";

function fmtOdo(m?: number | null, units: "imperial" | "metric" = "imperial") {
  if (m == null) return "-";
  return units === "imperial" ? `${(m / 1609.344).toFixed(1)} mi` : `${(m / 1000).toFixed(1)} km`;
}

const TrucksPage: React.FC = () => {
  console.log("✨ Trucks PAGE v2 (pages/trucks/TrucksPage.tsx) loaded");

  const { trucks, upsertTruck, removeTruck, upsertManyTrucks, settings } = useTms();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Truck | null>(null);
  const [busy, setBusy] = useState(false);
  const units = settings?.units ?? "imperial";

  // автозагрузка из БД при заходе
  useEffect(() => {
    (async () => {
      try {
        const rows = await listTrucks();
        if (rows.length) upsertManyTrucks(rows);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setBusy(true);
    try {
      const idSource = settings?.samsaraIdSource ?? "name";
      const data = await syncSamsara(idSource);
      upsertManyTrucks(data.trucks || []);
      await dbUpsertTrucks(data.trucks || []); // сохранить в БД
      alert(`Synced & saved ${data.trucks?.length ?? 0} trucks`);
    } catch (e: any) {
      alert(`Sync error: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function loadFromDb() {
    setBusy(true);
    try {
      const rows = await listTrucks();
      upsertManyTrucks(rows);
      alert(`Loaded ${rows.length} trucks from DB`);
    } catch (e: any) {
      alert(`Load error: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveAllToDb() {
    setBusy(true);
    try {
      await dbUpsertTrucks(trucks);
      alert(`Saved ${trucks.length} trucks to DB`);
    } catch (e: any) {
      alert(`Save error: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveOne(t: Truck) {
    setBusy(true);
    try {
      await dbUpsertTruck(t);
      upsertTruck(t);
      setEdit(null);
    } catch (e: any) {
      alert(`Save error: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function removeOne(id: string) {
    setBusy(true);
    try {
      await dbDeleteTruck(id);
      removeTruck(id);
    } catch (e: any) {
      alert(`Delete error: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          Trucks <span className="text-xs opacity-70 align-middle">• DB linked ★</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          <input className="input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn" disabled={busy} onClick={loadFromDb}>Load from DB</button>
          <button className="btn" disabled={busy} onClick={saveAllToDb}>Save all to DB</button>
          <button className="btn btn-primary" disabled={busy} onClick={syncFromSamsara}>Sync from Samsara</button>
          <button className="btn" onClick={() => setEdit({ id: "", vin: "", make: "", odo: 0 })}>Add</button>
        </div>
      </div>

      <div className="grid gap-3">
        {list.map((t) => (
          <div key={t.id} className="p-4 rounded-xl border bg-white/5 shadow flex items-center justify-between">
            <div>
              <div className="font-semibold">{t.id} • {t.make ?? "-"}</div>
              <div className="text-sm opacity-70">VIN: {t.vin ?? "-"} • Plate: {t.plate ?? "-"} • Odo: {fmtOdo(t.odo, units)}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => setEdit(t)}>Edit</button>
              <button className="btn" onClick={() => removeOne(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <div className="p-4 rounded-xl border bg-white/5 shadow space-y-2">
          <div className="grid md:grid-cols-5 gap-2">
            <input className="input" placeholder="ID" value={edit.id} onChange={(e) => setEdit({ ...edit, id: e.target.value })} />
            <input className="input" placeholder="VIN" value={edit.vin ?? ""} onChange={(e) => setEdit({ ...edit, vin: e.target.value })} />
            <input className="input" placeholder="Make" value={edit.make ?? ""} onChange={(e) => setEdit({ ...edit, make: e.target.value })} />
            <input className="input" placeholder="Plate" value={edit.plate ?? ""} onChange={(e) => setEdit({ ...edit, plate: e.target.value })} />
            <input className="input" type="number" placeholder="Odometer (meters)" value={edit.odo ?? 0} onChange={(e) => setEdit({ ...edit, odo: Number(e.target.value) })} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" disabled={busy} onClick={() => saveOne(edit)}>Save</button>
            <button className="btn" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrucksPage;
