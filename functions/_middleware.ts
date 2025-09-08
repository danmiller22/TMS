// functions/_middleware.ts
// @ts-nocheck
// Безопасная защита только для /api/*
// - используем context.next() (как требует Cloudflare Pages)
// - динамически импортируем 'jose'
// - любые ошибки -> JSON, чтобы воркер не падал

export const onRequest = async (context) => {
  try {
    const url = new URL(context.request.url);

    // защищаем только /api/*
    if (!url.pathname.startsWith("/api/")) {
      return context.next();
    }

    const sbUrl =
      context.env?.VITE_SUPABASE_URL ||
      context.env?.SUPABASE_URL; // альтернативное имя, если так настроено

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

    // импортируем jose только при обращении к /api/*
    const { createRemoteJWKSet, jwtVerify } = await import("jose");
    const JWKS = createRemoteJWKSet(new URL(`${sbUrl}/auth/v1/.well-known/jwks.json`));

    await jwtVerify(token, JWKS, {
      issuer: `${sbUrl}/auth/v1`,
    });

    // токен валиден — пускаем дальше
    return context.next();
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Auth middleware error",
        detail: err?.message ?? String(err),
      }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }
};
