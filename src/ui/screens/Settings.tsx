// src/ui/screens/Settings.tsx
import React, { useState } from "react";
import useTms from "../../store/tms";
import { supabase } from "../../lib/supabase";

const Settings: React.FC = () => {
  const { settings, setSettings, clearAll } = useTms();
  const [src, setSrc] = useState<"name" | "licensePlate">(settings.samsaraIdSource || "name");
  const [docsUrl, setDocsUrl] = useState(settings.trailerDocsUrl || "");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border bg-white shadow">
          <div className="font-semibold mb-2">Samsara ID Source</div>
          <select className="input" value={src} onChange={e => setSrc(e.target.value as any)}>
            <option value="name">Vehicle name</option>
            <option value="licensePlate">License plate</option>
          </select>
          <button className="btn btn-primary mt-2" onClick={() => setSettings({ samsaraIdSource: src })}>Save</button>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow">
          <div className="font-semibold mb-2">Trailer documents URL</div>
          <input className="input" placeholder="https://..." value={docsUrl} onChange={e => setDocsUrl(e.target.value)} />
          <button className="btn mt-2" onClick={() => setSettings({ trailerDocsUrl: docsUrl.trim() })}>Save</button>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow space-y-2">
          <div className="font-semibold mb-1">Account</div>
          <button className="btn" onClick={async()=>{ await supabase.auth.signOut(); window.location.assign("/signin"); }}>
            Sign out
          </button>
          <div className="font-semibold mt-4 mb-1">Danger zone</div>
          <button className="btn" onClick={() => clearAll()}>Clear local data</button>
        </div>
      </div>
    </div>
  );
};

export { Settings };
export default Settings;
