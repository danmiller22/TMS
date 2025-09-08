// src/lib/samsara.ts
export async function syncSamsara(idSource: "name" | "licensePlate" = "name") {
  const url =
    new URL("/api/samsara/sync", window.location.origin).toString() +
    `?idSource=${encodeURIComponent(idSource)}`;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    // попытаемся вытащить текст ошибки из JSON (если он есть)
    let errText = "Sync failed";
    try {
      const j = await res.json();
      errText = j?.error || errText;
    } catch {}
    throw new Error(errText);
  }
  return (await res.json()) as { trucks: any[] };
}
