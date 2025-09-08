// src/ui/screens/Signin.tsx
import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isUp, setIsUp] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (isUp) {
        const { error } = await supabase.auth.signUp({ email, password: pass });
        if (error) throw error;
        alert("Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        window.location.assign("/");
      }
    } catch (e: any) {
      alert(e.message || e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">{isUp ? "Sign up" : "Sign in"}</h1>
      <input className="input w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input w-full" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
      <button className="btn btn-primary w-full" disabled={busy} onClick={submit}>
        {isUp ? "Create account" : "Sign in"}
      </button>
      <button className="btn w-full" onClick={()=>setIsUp(!isUp)}>
        {isUp ? "I have an account" : "Create account"}
      </button>
    </div>
  );
};

export { Signin };
export default Signin;
