// functions/_middleware.ts
// Защищаем только /api/* токеном Supabase. Сделано безопасно для Pages:
// - никакого кода на верхнем уровне, который может падать
// - jose подгружаем динамически только при обращении к /api
// - любые ошибки ловим и возвращаем JSON вместо падения воркера

export const onRequest = async (context: any, next: any) => {
  try {
    const url = new URL(context.request.url);

    // Защищаем только API. Для всего остального сразу пропускаем.
    if (!url.pathname.startsWith("/api/")) {
      return next();
    }

    const sbUrl =
      context.env?.VITE_SUPABASE_URL ||
      context.env?.SUPABASE_URL; // на всякий случай альтернативное имя

    if (!sbUrl) {
      return new Response(JSON.stringify({ error: "Missing VITE_SUPABASE_URL env" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const auth = context.request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    // Подгружаем jose только когда реально нужен (/api/*)
    const { createRemoteJWKSet, jwtVerify } = await import("jose");

    const JWKS = createRemoteJWKSet(new URL(`${sbUrl}/auth/v1/.well-known/jwks.json`));

    await jwtVerify(token, JWKS, {
      issuer: `${sbUrl}/auth/v1`,
    });

    // Всё ок — пускаем к реальному хендлеру
    return next();
  } catch (err: any) {
    // НИЧЕГО не бросаем наверх — всегда возвращаем JSON, чтобы воркер не падал (и не было 1101)
    return new Response(
      JSON.stringify({
        error: "Auth middleware error",
        detail: typeof err?.message === "string" ? err.message : String(err),
      }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }
};
