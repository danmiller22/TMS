// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { RequireAuth } from "./lib/auth";
import { Header } from "./components/Header";
import { Dashboard } from "./ui/screens/Dashboard";

// ВАЖНО: именно pages/trucks
import Trucks from "./pages/trucks/Trucks";

import Trailers from "./ui/screens/Trailers";
import Cases from "./ui/screens/Cases";
import Analytics from "./ui/screens/Analytics";
import Finance from "./ui/screens/Finance";
import Settings from "./ui/screens/Settings";
import Signin from "./ui/screens/Signin";

const MainLayout: React.FC = () => (
  <>
    <Header />
    <div className="p-4 max-w-6xl mx-auto"><Outlet /></div>
  </>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/signin" element={<Signin />} />
      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="/trucks" element={<Trucks />} />
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
