"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

export function DashboardCharts({
  volume,
  reasons,
  strength,
  funnel,
  escalation,
}: {
  volume: { day: string; count: number }[];
  reasons: Record<string, number>;
  strength: { strong: number; medium: number; weak: number };
  funnel: { name: string; value: number }[];
  escalation: number;
}) {
  const reasonData = Object.entries(reasons).map(([name, value]) => ({ name: name.replaceAll("_", " "), value }));
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <h3 className="mb-4 text-sm text-muted">Dispute volume</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={volume}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--cyan)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h3 className="mb-4 text-sm text-muted">Dispute reasons</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={reasonData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--ai)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h3 className="mb-4 text-sm text-muted">Evidence strength</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={[
                { name: "Strong", value: strength.strong },
                { name: "Medium", value: strength.medium },
                { name: "Weak", value: strength.weak },
              ]} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                <Cell fill="var(--emerald)" />
                <Cell fill="var(--amber)" />
                <Cell fill="var(--danger)" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h3 className="mb-4 text-sm text-muted">Outcome funnel · human escalation {escalation}%</h3>
        <div className="space-y-3">
          {funnel.map((item) => (
            <div key={item.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-muted">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-sunken">
                <div className="h-2 rounded-full bg-cyan" style={{ width: `${Math.min(100, (item.value / (funnel[0]?.value || 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
