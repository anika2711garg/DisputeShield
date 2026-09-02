"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 12,
};

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
      <ChartCard title="Dispute volume">
        <ResponsiveContainer>
          <BarChart data={volume}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Disputes by reason">
        <ResponsiveContainer>
          <BarChart data={reasonData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={150} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="var(--violet)" radius={[0, 6, 6, 0]} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Evidence strength">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={[
                { name: "Strong", value: strength.strong },
                { name: "Medium", value: strength.medium },
                { name: "Weak", value: strength.weak },
              ]}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={80}
            >
              <Cell fill="var(--emerald)" />
              <Cell fill="var(--amber)" />
              <Cell fill="var(--danger)" />
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <Card>
        <h3 className="mb-4 text-[13px] text-muted">Contest / accept / pending · human escalation {escalation}%</h3>
        <div className="space-y-3">
          {funnel.map((item, index) => (
            <div key={item.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-muted">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sunken">
                <motion.div
                  className="h-2 rounded-full bg-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (item.value / (funnel[0]?.value || 1)) * 100)}%` }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card>
        <h3 className="mb-4 text-[13px] text-muted">{title}</h3>
        <div className="h-56">{children}</div>
      </Card>
    </motion.div>
  );
}
