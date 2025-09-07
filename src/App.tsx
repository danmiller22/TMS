import { NavLink, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "./store/auth";

import { Dashboard } from "./ui/screens/Dashboard";
import Trucks from "./ui/screens/Trucks";
import Trailers from "./ui/screens/Trailers";
import { Cases } from "./ui/screens/Cases";
import { Finance } from "./ui/screens/Finance";
import { Analytics } from "./ui/screens/Analytics";
import { Settings } from "./ui/screens/Settings";
import SignIn from "./ui/screens/SignIn";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const prefers = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = (localStorage.getItem("theme") ?? (prefers ? "dark" : "light")) === "dark";
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);
  return (
    <button
      className="px-2 py-1 rounded-lg hover:bg-white/5"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
      }}
      title="Toggle theme"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

function AppHeader({ authed }: { authed: boolean }) {
  const { signOut } = useAuth();

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/trucks", label: "Trucks" },
    { to: "/trailers", label: "Trailers" },
    { to: "/cases", label: "Cases" },
    { to: "/finance", label: "Finance" },
    { to: "/analytics", label: "Analytics" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <header className="app-header sticky top-0 z-50 border-b border-border">
      <div className="w-full px-2 md:px-3 py-2 md:py-3 flex items-center gap-2">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="US Team Fleet" className="w-10 h-10 md:w-11 md:h-11 rounded-md" />
          <div className="text-lg md:text-xl font-semibold tracking-tight">US Team Fleet</div>
        </a>

        {authed && (
          <nav className="ml-2 md:ml-4 hidden md:flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `nav-pill ${isActive ? "active" : "idle"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1">
          {authed && (
            <button className="px-3 py-1 rounded-lg hover:bg-white/5 font-semibold" onClick={() => signOut()}>
              Sign out
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const pageSpring = { type: "spring", stiffness: 320, damping: 30, mass: 0.85 };

  if (!user) {
    return (
      <div className="min-h-full flex flex-col">
        <AppHeader authed={false} />
        <main className="mx-auto max-w-6xl p-4 md:p-8 w-full flex-1">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <AppHeader authed />
      <main className="mx-auto max-w-6xl p-4 md:p-8 w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12, scale: 0.995, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, scale: 0.995, filter: "blur(3px)" }}
            transition={pageSpring}
          >
            <Routes location={location}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trucks" element={<Trucks />} />
              <Route path="/trailers" element={<Trailers />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/signin" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm opacity-70">
          ‘It’s our duty to lead people to the light’ — Dan Miller
        </div>
      </footer>
    </div>
  );
}
