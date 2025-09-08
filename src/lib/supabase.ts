// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// читаем из Vite и (на всякий) из глобалов
function readEnv() {
  const v: any = (import.meta as any)?.env || {};
  const url = v.VITE_SUPABASE_URL || (globalThis as any).VITE_SUPABASE_URL || "";
  const key = v.VITE_SUPABASE_ANON_KEY || (globalThis as any).VITE_SUPABASE_ANON_KEY || "";
  return { url, key };
}

const { url, key } = readEnv();

let client: SupabaseClient;

if (url && key) {
  client = createClient(url, key);
} else {
  console.warn("[supabase] ENV missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");

  // мягкая заглушка, НИЧЕГО не бросает, всегда возвращает {data:null, error:Error}
  const softErr = (msg = "Supabase ENV missing (VITE_SUPABASE_*)") =>
    ({ data: null, error: new Error(msg) });

  client = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => softErr(),
      signUp: async () => softErr(),
      signOut: async () => ({ error: null }),
    },
    from() {
      return {
        select: async () => softErr(),
        upsert: async () => softErr(),
        delete: async () => softErr(),
        insert: async () => softErr(),
        update: async () => softErr(),
      } as any;
    },
  } as any;
}

export const supabase = client;
