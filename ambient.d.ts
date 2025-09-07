// src/ambient.d.ts
// Silence TypeScript for optional libs and CDN imports.

declare module "xlsx";
declare module "jspdf";

// allow any HTTPS CDN ESM imports in dynamic import()
declare module "https://*";
