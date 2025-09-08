// src/lib/auth.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [has, setHas] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHas(!!data.session);
      setReady(true);
      if (!data.session) nav("/signin");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setHas(!!s);
      if (!s) nav("/signin");
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [nav]);

  if (!ready) return <div className="p-6">Loading…</div>;
  if (!has) return null;
  return <>{children}</>;
};
