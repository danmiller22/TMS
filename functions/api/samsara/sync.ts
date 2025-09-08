// functions/api/samsara/sync.ts
// @ts-nocheck
// Cloudflare Pages Function: /api/samsara/sync
// Тянет траки и последние статусы из Samsara и отдаёт фронту нормализованный список.

type Cfg = { token: string };
const API_BASE = "https://api.samsara.com";

async function samsaraGET<T>(cfg: Cfg, path: string, query?: Record<string, string>) {
  const u = new URL(API_BASE + path);
  if (query) for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
  const res = await fetch(u.toString(), {
    headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Samsara ${path} ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

type Vehicle = {
  id: string | number;
  name?: string;
  vin?: string;
  licensePlate?: string;
  make?: string;
};

type VehicleStat = {
  vehicleId?: string | number;
  gps?: { latitude?: number; longitude?: number; timeMs?: number };
  gpsOdometerMeters?: { value?: number; timeMs?: number };
  obdOdometerMeters?: { value?: number; timeMs?: number };
  engineStates?: { engineOn?: boolean; timeMs?: number };
};

export const onRequestGet = async (ctx: any) => {
  try {
    const token = (ctx.env.SAMSARA_API_TOKEN || ctx.env.VITE_SAMSARA_API_TOKEN) as string | undefined;
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing SAMSARA_API_TOKEN" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const idSource = new URL(ctx.request.url).searchParams.get("idSource") || "name";
    const cfg: Cfg = { token };

    // 1) список юнитов
    const vRes = await samsaraGET<{ data: Vehicle[] }>(cfg, "/fleet/vehicles", { limit: "200" });
    const vehicles = vRes.data ?? [];

    // 2) последние статусы (gps/odom/engine) — если нет доступа, тихо продолжим без них
    const stats = await samsaraGET<{ data: VehicleStat[] }>(
      cfg,
      "/fleet/vehicles/stats",
      { types: "gps,obdOdometerMeters,gpsOdometerMeters,engineStates" }
    ).catch(() => ({ data: [] as VehicleStat[] }));

    const byId = new Map<string, VehicleStat>();
    for (const s of stats.data) {
      const id = String(s.vehicleId ?? (s as any).id ?? "");
      if (id) byId.set(id, s);
    }

    // 3) нормализация
    const trucks = vehicles.map((v) => {
      const sid = String((v as any).id ?? "");
      const s = byId.get(sid) || ({} as VehicleStat);
      const lat = s.gps?.latitude;
      const lon = s.gps?.longitude;
      const lastMs =
        s.gps?.timeMs || s.obdOdometerMeters?.timeMs || s.gpsOdometerMeters?.timeMs || s.engineStates?.timeMs;
      const odos = [s.obdOdometerMeters?.value, s.gpsOdometerMeters?.value].filter(
        (n) => typeof n === "number"
      ) as number[];
      const odo = odos.length ? Math.max(...odos) : null;

      const id =
        idSource === "licensePlate"
          ? v.licensePlate || v.name || v.vin || sid
          : v.name || v.licensePlate || v.vin || sid;

      return {
        id,
        name: v.name,
        vin: v.vin,
        plate: v.licensePlate,
        make: (v as any).make,
        odo,
        status: s.engineStates?.engineOn ? "Engine On" : "Idle",
        lastSeen: lastMs ? new Date(lastMs).toISOString() : undefined,
        location: lat && lon ? { lat, lon } : null,
      };
    });

    return new Response(JSON.stringify({ trucks }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
