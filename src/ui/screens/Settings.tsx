// src/ui/screens/Settings.tsx
import { useState } from "react";
import { useTms } from "../../store/tms";

const input =
  "rounded-xl border border-border bg-background text-foreground placeholder:text-foreground/50 px-3 py-2 w-full";

export function Settings() {
  const { settings, setSettings } = useTms();
  const [src, setSrc] = useState<"name" | "licensePlate">(settings.samsaraIdSource || "name");

  const save = () => {
    setSettings({ samsaraIdSource: src });
    alert("Saved.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="glass rounded-2xl p-5 border border-border space-y-3">
        <div className="text-lg font-semibold">Samsara</div>
        <div className="text-sm opacity-70">
          Where to read the unit number from during sync: <code>name</code> (usually unit #) or{" "}
          <code>licensePlate</code> (if your unit # equals the plate).
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">
            Source
            <select className={input + " mt-1"} value={src} onChange={(e) => setSrc(e.target.value as any)}>
              <option value="name">name</option>
              <option value="licensePlate">licensePlate</option>
            </select>
          </label>
        </div>
        <button className="btn btn-primary" onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
}
