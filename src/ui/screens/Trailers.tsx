// src/ui/screens/Trailers.tsx
import { useEffect, useRef, useState } from "react";
import useTms, { Trailer } from "../../store/tms";
import { motion } from "framer-motion";

const inputCls =
  "mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background text-foreground " +
  "placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-white/10";

function TrailerEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: Trailer;
  onSave: (t: Trailer) => void;
  onCancel: () => void;
}) {
  const [id, setId] = useState(initial.id || "");
  const canSave = id.trim().length > 0;
  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <h2 className="text-lg font-semibold mb-3">{initial.id ? `Edit ${initial.id}` : "New trailer"}</h2>
      <label className="text-sm">
        Unit #
        <input
          className={inputCls}
          placeholder="e.g. T-110"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSave && onSave({ id: id.trim() })}
        />
      </label>

      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary disabled:opacity-50" onClick={() => onSave({ id: id.trim() })} disabled={!canSave}>
          Save
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Trailers() {
  const { trailers, upsertTrailer, removeTrailer, upsertManyTrailers, settings, setSettings } = useTms();
  const [editing, setEditing] = useState<Trailer | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [docsUrl, setDocsUrl] = useState(settings.trailerDocsUrl || "");
  const didInit = useRef(false);

  async function syncFromSamsara(silent = false) {
    try {
      setSyncing(true);
      const res = await fetch("http://localhost:7070/api/samsara/sync");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (Array.isArray(data.trailers)) upsertManyTrailers(data.trailers);
      if (!silent) alert(`Synced ${data.trailers?.length ?? 0} trailers`);
    } catch (e: any) {
      if (!silent) alert("Sync error: " + (e?.message || e));
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (trailers.length === 0) syncFromSamsara(true);
  }, [trailers.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trailers</h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => syncFromSamsara()} disabled={syncing}>
            {syncing ? "Syncing…" : "Sync from Samsara"}
          </button>
          <button className="btn btn-primary" onClick={() => setEditing({ id: "" })}>
            Add
          </button>
        </div>
      </div>

      {/* Trailer Documents — the only place */}
      <div className="glass rounded-2xl p-4 border border-border flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="font-semibold">Trailer Documents</div>
          <div className="text-sm opacity-70">Shared Google Drive folder for all trailers.</div>
          <label className="text-sm block mt-2">
            Link
            <input
              className={inputCls}
              placeholder="https://drive.google.com/drive/folders/..."
              value={docsUrl}
              onChange={(e) => setDocsUrl(e.target.value)}
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setSettings({ trailerDocsUrl: docsUrl.trim() });
              alert("Saved.");
            }}
          >
            Save
          </button>
          <a
            className="btn btn-primary"
            href={(settings.trailerDocsUrl || docsUrl || "#").trim()}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              const url = (settings.trailerDocsUrl || docsUrl || "").trim();
              if (!url) {
                e.preventDefault();
                alert("Paste the link above and click Save.");
              }
            }}
          >
            Open
          </a>
        </div>
      </div>

      {editing && (
        <TrailerEditor
          initial={editing}
          onSave={(t) => {
            upsertTrailer(t);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Compact grid for many units */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {trailers.map((t) => (
          <motion.div
            key={t.id}
            layout
            className="glass rounded-xl p-3 border border-border"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="text-base font-semibold">#{t.id}</div>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-ghost px-3 py-1.5 text-sm" onClick={() => setEditing(t)}>
                Edit
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-xl bg-red-500/90 hover:bg-red-500 text-white"
                onClick={() => removeTrailer(t.id)}
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export { Trailers };
