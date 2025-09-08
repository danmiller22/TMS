// functions/_middleware.ts
// @ts-nocheck
// Требует валидный Supabase JWT для всех путей /api/*

import { createRemoteJWKSet, jwtVerify } from "jose";

let JWKS: any = null;

export const onRequest = async (ctx: any, next: any) => {
  const url = new URL(ctx.request.url);
  if (!url.pathname.startsWith("/api/")) {
    // только API защищаем
    return next();
  }

  const sbUrl = ctx.env.VITE_SUPABASE_URL || ctx.env.SUPABASE_URL;
  if (!sbUrl) {
    return new Response(JSON.stringify({ error: "Missing VITE_SUPABASE_URL env" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const auth = ctx.request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    if (!JWKS) {
      JWKS = createRemoteJWKSet(new URL(`${sbUrl}/auth/v1/.well-known/jwks.json`));
    }
    // issuer у Supabase: {SUPABASE_URL}/auth/v1
    await jwtVerify(token, JWKS, { issuer: `${sbUrl}/auth/v1` });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  return next();
};
