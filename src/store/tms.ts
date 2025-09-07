// src/store/tms.ts
import { create } from "zustand";

/* ========= Types & constants ========= */

export type CaseStage = "New" | "Diagnosing" | "Repair" | "QA" | "Closed";
export const CASE_STAGES: CaseStage[] = ["New", "Diagnosing", "Repair", "QA", "Closed"];

// в проекте встречается "Urgent" — добавляем в тип
export type Urgency = "Low" | "Medium" | "High" | "Critical" | "Urgent";

export type InvoiceFile = {
  name?: string;
  amount?: number;
  currency?: string;
  docId?: string;
  dataUrl?: string;
  mime?: string;
  size?: number; // pages/cases/Cases.tsx ожидает это поле
};

export type Truck = {
  id: string;
  vin?: string;
  make?: string;
  plate?: string;
  odo?: number | null;
  status?: string;
  lastSeen?: string;
  location?: { lat?: number; lon?: number; address?: string } | null;
  name?: string;
};

export type Trailer = {
  id: string;
  owner?: string;
  extCode?: string;
  type?: string;   // "Dry Van" / "Reefer" / ...
  status?: string; // "Ready" / ...
};

export type TimelineEntry = {
  text: string;
  at?: string; // встречаются оба названия
  ts?: string;
};

export type CaseItem = {
  id: string;
  title: string;
  assetId?: string;
  type?: string;
  severity?: Urgency;
  stage: CaseStage;
  openedAt: string;
  until?: string;
  untilId?: string;
  timeline: TimelineEntry[];
  invoice?: InvoiceFile;
};

// Ledger: подгон под pages/* и ui/* (type/ref/category используются в коде)
export type LedgerEntry = {
  id?: string;           // делаем опц., т.к. в коде иногда не передаётся
  date?: string;         // опц.; если нет — заполним сейчас ISO-датой
  amount: number;
  currency?: string;
  note?: string;

  type?: "expense" | "income" | string; // фильтрация по .type==="expense"
  kind?: string;        // на всякий
  ref?: string;         // YMD-строка для группировок
  category?: string;    // для таблиц/дашборда
  caseId?: string;
  assetId?: string;
};

export type Settings = {
  idSource?: "id" | "vin" | "plate" | "name";
  samsaraIdSource?: "name" | "licensePlate"; // используется в Settings.tsx
  trailerDocsUrl?: string;                   // используется в Trailers.tsx
  units?: "imperial" | "metric";
  theme?: "light" | "dark" | "auto";
  companyName?: string;
};

/* ========= Store shape ========= */

export type TmsState = {
  trucks: Truck[];
  trailers: Trailer[];
  cases: CaseItem[];
  ledger: LedgerEntry[];
  settings: Settings;

  // Trucks
  addTruck: (t: Truck) => void;
  updateTruck: (id: string, patch: Partial<Truck>) => void;
  deleteTruck: (id: string) => void;

  // aliases под вызовы из страниц/скринов
  upsertTruck: (t: Truck) => void;
  removeTruck: (id: string) => void;
  upsertManyTrucks: (arr: Truck[]) => void;

  // Trailers
  addTrailer: (t: Trailer) => void;
  updateTrailer: (id: string, patch: Partial<Trailer>) => void;
  deleteTrailer: (id: string) => void;

  // aliases
  upsertTrailer: (t: Trailer) => void;
  removeTrailer: (id: string) => void;
  upsertManyTrailers: (arr: Trailer[]) => void;

  // Cases
  addCase: (c: Partial<CaseItem> & { id: string; title: string; stage?: CaseStage }) => void;
  updateCase: (id: string, patch: Partial<CaseItem>) => void;
  setCaseStage: (id: string, stage: CaseStage) => void;
  advanceCase: (id: string, next?: CaseStage) => void;
  addCaseNote: (id: string, text: string) => void;
  attachInvoice: (id: string, invoice: InvoiceFile) => void;

  // Ledger (принимаем частичный объект и добиваем недостающее)
  addLedger: (e: Partial<LedgerEntry> & { amount: number }) => void;

  // Settings
  setSettings: (patch: Partial<Settings>) => void;

  // Import/clear
  importJson: (data: Partial<Pick<TmsState, "trucks" | "trailers" | "cases" | "ledger" | "settings">>) => void;
  clearAll: () => void;
};

/* ========= Store implementation ========= */

export const useTms = create<TmsState>((set, get) => ({
  trucks: [],
  trailers: [],
  cases: [],
  ledger: [],
  settings: {
    idSource: "id",
    samsaraIdSource: "name",
    trailerDocsUrl: "",
    units: "imperial",
    theme: "light",
  },

  /* Trucks */
  addTruck: (t) =>
    set((s) => ({ trucks: [...s.trucks.filter((x) => x.id !== t.id), t] })),

  updateTruck: (id, patch) =>
    set((s) => ({ trucks: s.trucks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

  deleteTruck: (id) =>
    set((s) => ({ trucks: s.trucks.filter((t) => t.id !== id) })),

  // aliases
  upsertTruck: (t) =>
    set((s) => {
      const exists = s.trucks.some((x) => x.id === t.id);
      return { trucks: exists ? s.trucks.map((x) => (x.id === t.id ? { ...x, ...t } : x)) : [...s.trucks, t] };
    }),
  removeTruck: (id) =>
    set((s) => ({ trucks: s.trucks.filter((t) => t.id !== id) })),
  upsertManyTrucks: (arr) =>
    set((s) => {
      const map = new Map<string, Truck>(s.trucks.map((t) => [t.id, t]));
      arr.forEach((t) => map.set(t.id, { ...map.get(t.id), ...t }));
      return { trucks: Array.from(map.values()) };
    }),

  /* Trailers */
  addTrailer: (t) =>
    set((s) => ({ trailers: [...s.trailers.filter((x) => x.id !== t.id), t] })),

  updateTrailer: (id, patch) =>
    set((s) => ({ trailers: s.trailers.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

  deleteTrailer: (id) =>
    set((s) => ({ trailers: s.trailers.filter((t) => t.id !== id) })),

  // aliases
  upsertTrailer: (t) =>
    set((s) => {
      const exists = s.trailers.some((x) => x.id === t.id);
      return {
        trailers: exists ? s.trailers.map((x) => (x.id === t.id ? { ...x, ...t } : x)) : [...s.trailers, t],
      };
    }),
  removeTrailer: (id) =>
    set((s) => ({ trailers: s.trailers.filter((t) => t.id !== id) })),
  upsertManyTrailers: (arr) =>
    set((s) => {
      const map = new Map<string, Trailer>(s.trailers.map((t) => [t.id, t]));
      arr.forEach((t) => map.set(t.id, { ...map.get(t.id), ...t }));
      return { trailers: Array.from(map.values()) };
    }),

  /* Cases */
  addCase: (c) =>
    set((s) => ({
      cases: [
        ...s.cases,
        {
          id: c.id,
          title: c.title,
          assetId: c.assetId,
          type: c.type,
          severity: c.severity ?? "Low",
          stage: c.stage ?? "New",
          openedAt: new Date().toISOString(),
          until: c.until,
          untilId: c.untilId,
          timeline: [{ at: new Date().toISOString(), ts: new Date().toISOString(), text: "Case opened" }],
          invoice: c.invoice,
        },
      ],
    })),

  updateCase: (id, patch) =>
    set((s) => ({
      cases: s.cases.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  setCaseStage: (id, stage) =>
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              stage,
              timeline: [
                ...c.timeline,
                { at: new Date().toISOString(), ts: new Date().toISOString(), text: `Stage → ${stage}` },
              ],
            }
          : c
      ),
    })),

  advanceCase: (id, next) => {
    const order = CASE_STAGES;
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== id) return c;
        const idx = order.indexOf(c.stage);
        const newStage = next ?? order[Math.min(idx + 1, order.length - 1)];
        return {
          ...c,
          stage: newStage,
          timeline: [
            ...c.timeline,
            { at: new Date().toISOString(), ts: new Date().toISOString(), text: `Stage → ${newStage}` },
          ],
        };
      }),
    }));
  },

  addCaseNote: (id, text) =>
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              timeline: [
                ...c.timeline,
                { at: new Date().toISOString(), ts: new Date().toISOString(), text: `Note: ${text}` },
              ],
            }
          : c
      ),
    })),

  attachInvoice: (id, invoice) =>
    set((s) => ({
      cases: s.cases.map((c) => (c.id === id ? { ...c, invoice } : c)),
    })),

  /* Ledger */
  addLedger: (e) =>
    set((s) => {
      const genId = () => "L-" + Math.random().toString(36).slice(2, 10);
      // если пришёл ref в формате YYYY-MM-DD — используем для даты
      const isoFromRef = (ref?: string) => (ref ? new Date(ref).toISOString() : undefined);

      const entry: LedgerEntry = {
        ...e,
        id: e.id ?? genId(),
        date: e.date ? new Date(e.date).toISOString() : isoFromRef(e.ref) ?? new Date().toISOString(),
        type: e.type ?? (e.kind ? e.kind.toLowerCase() : undefined),
      };

      return { ledger: [...s.ledger, entry] };
    }),

  /* Settings */
  setSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  /* Import / clear */
  importJson: (data) =>
    set((s) => ({
      trucks: data.trucks ?? s.trucks,
      trailers: data.trailers ?? s.trailers,
      cases: data.cases ?? s.cases,
      ledger: data.ledger ?? s.ledger,
      settings: data.settings ? { ...s.settings, ...data.settings } : s.settings,
    })),

  clearAll: () => set({ trucks: [], trailers: [], cases: [], ledger: [] }),
}));

export default useTms;
