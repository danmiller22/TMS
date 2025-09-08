// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Читаем значения из Vite env (прод) и из глобалов, если вдруг прокинули иначе
function readEnv() {
  const v: any = (import.meta as any)?.env || {};
  const url = v.VITE_SUPABASE_URL || (globalThis as any).VITE_SUPABASE_URL || "";
  const key = v.VITE_SUPABASE_ANON_KEY || (globalThis as any).VITE_SUPABASE_ANON_KEY || "";
  return { url, key };
}

const { url, key } = readEnv();

let client: SupabaseClient;

if (url && key) {
  // Нормальный клиент — если переменные заданы
  client = createClient(url, key);
} else {
  // «Безопасный заглушечный» клиент — чтобы приложение не падало белым экраном
  console.warn("[supabase] ENV missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
  const err = () => Promise.reject(new Error("Supabase ENV missing (VITE_SUPABASE_*)"));
  client = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: err,
      signUp: err,
      signOut: async () => ({ error: null }),
    },
    from() {
      return {
        select: err,
        upsert: err,
        delete: err,
        insert: err,
        update: err,
      } as any;
    },
  } as any;
}

export const supabase = client;
