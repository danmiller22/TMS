// src/services/db.ts
import { supabase } from "../lib/supabase";
import type { Truck } from "../store/tms";

// ============ TRUCKS ============

function toTruck(row: any): Truck {
  return {
    id: row.id,
    vin: row.vin ?? undefined,
    make: row.make ?? undefined,
    plate: row.plate ?? undefined,
    name: row.name ?? undefined,
    odo: row.odo != null ? Number(row.odo) : null,
    status: row.status ?? undefined,
    lastSeen: row.last_seen ?? undefined,
    location: row.location ?? undefined,
  };
}

function fromTruck(t: Truck) {
  return {
    id: t.id,
    vin: t.vin ?? null,
    make: t.make ?? null,
    plate: t.plate ?? null,
    name: t.name ?? null,
    odo: t.odo ?? null,
    status: t.status ?? null,
    last_seen: t.lastSeen ? new Date(t.lastSeen).toISOString() : null,
    location: t.location ?? null, // jsonb
  };
}

export async function listTrucks(): Promise<Truck[]> {
  const { data, error } = await supabase.from("trucks").select("*").order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toTruck);
}

export async function upsertTrucks(rows: Truck[]): Promise<void> {
  const payload = rows.map(fromTruck);
  const { error } = await supabase.from("trucks").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function upsertTruck(t: Truck): Promise<void> {
  const { error } = await supabase.from("trucks").upsert(fromTruck(t), { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteTruck(id: string): Promise<void> {
  const { error } = await supabase.from("trucks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
