// src/ui/screens/Analytics.tsx
import React from "react";
import useTms from "../../store/tms";

const Card: React.FC<{ title: string; value: string | number; hint?: string }> = ({ title, value, hint }) => (
  <div className="p-4 rounded-xl shadow border bg-white">
    <div className="text-sm opacity-70">{title}</div>
    <div className="text-2xl font-semibold">{value}</div>
    {hint ? <div className="text-xs opacity-60 mt-1">{hint}</div> : null}
  </div>
);

const Analytics: React.FC = () => {
  const { trucks, trailers, cases } = useTms();

  const openCases = cases.filter(c => c.stage !== "Closed").length;
  const urgent = cases.filter(c => (c.severity === "High" || c.severity === "Critical" || c.severity === "Urgent")).length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Trucks" value={trucks.length} />
        <Card title="Trailers" value={trailers.length} />
        <Card title="Open cases" value={openCases} />
        <Card title="Urgent" value={urgent} hint="High/Critical/Urgent" />
      </div>
    </div>
  );
};

// и именованный, и дефолтный экспорт — чтобы App.tsx не менять
export { Analytics };
export default Analytics;
