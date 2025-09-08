// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { RequireAuth } from "./lib/auth";
import { Header } from "./components/Header";
import { Dashboard } from "./ui/screens/Dashboard";

// Trucks
import TrucksPage from "./pages/trucks/TrucksPage";

// Остальные экраны
import Trailers from "./ui/screens/Trailers";
import Cases from "./ui/screens/Cases";
import Analytics from "./ui/screens/Analytics";
import Finance from "./ui/screens/Finance";
import Settings from "./ui/screens/Settings";

// Supabase для логина
import { supabase } from "./lib/supabase";

/** Встроенная страница входа — больше НЕ нужен импорт ./ui/screens/Signin */
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
        alert("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        window.location.assign("/");
      }
    } catch (e: any) {
      alert(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">{isUp ? "Sign up" : "Sign in"}</h1>
      <input
        className="input w-full"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input w-full"
        type="password"
        placeholder="Password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <button className="btn btn-primary w-full" disabled={busy} onClick={submit}>
        {isUp ? "Create account" : "Sign in"}
      </button>
      <button className="btn w-full" onClick={() => setIsUp(!isUp)}>
        {isUp ? "I have an account" : "Create account"}
      </button>
    </div>
  );
};

const MainLayout: React.FC = () => (
  <>
    <Header />
    <div className="p-4 max-w-6xl mx-auto">
      <Outlet />
    </div>
  </>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/signin" element={<Signin />} />
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/trucks" element={<TrucksPage />} />
        <Route path="/trailers" element={<Trailers />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
