// src/lib/samsara.ts
import { supabase } from "./supabase";

export async function syncSamsara(idSource: "name" | "licensePlate" = "name") {
  const url =
    new URL("/api/samsara/sync", window.location.origin).toString() +
    `?idSource=${encodeURIComponent(idSource)}`;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let msg = "Sync failed";
    try { msg = (await res.json())?.error || msg; } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as { trucks: any[] };
}
