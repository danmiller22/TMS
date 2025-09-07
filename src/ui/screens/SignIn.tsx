// src/ui/screens/SignIn.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";

const input =
  "mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

export default function SignIn() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  function submit() {
    setErr("");
    if (!username.trim() || !password) {
      setErr("Enter username and password.");
      return;
    }
    const ok = signIn(username, password);
    if (!ok) {
      setErr("Invalid username or password.");
      return;
    }
    nav("/", { replace: true });
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <img src="/logo.png" className="w-10 h-10 rounded-md" />
          <div className="text-xl font-semibold">US Team Fleet</div>
        </div>

        <div className="space-y-3">
          <label className="text-sm block">
            Username
            <input
              className={input}
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </label>
          <label className="text-sm block">
            Password
            <input
              className={input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </label>

          {err && <div className="text-sm text-red-400">{err}</div>}

          <button className="btn btn-primary w-full mt-2" onClick={submit}>
            Sign in
          </button>

          <button
            className="btn btn-ghost w-full"
            onClick={() => setShowSignup(true)}
            type="button"
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Sign up modal */}
      {showSignup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6">
            <div className="text-lg font-semibold mb-2">Access by request</div>
            <p className="text-sm opacity-80 mb-4">
              To get an account, please contact:
            </p>
            <div className="rounded-xl border border-border p-4 bg-background">
              <div className="font-semibold mb-1">Dan Miller</div>
              <div className="text-sm">📞 630-888-3047</div>
              <div className="text-sm">
                ✉️{" "}
                <a className="underline" href="mailto:dan@usteamcorp.com">
                  dan@usteamcorp.com
                </a>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setShowSignup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
