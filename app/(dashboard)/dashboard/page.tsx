import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { dashboardMetrics } from "@/lib/services/analytics-service";
import { formatCompactInr, formatInr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/charts";
import { recommendationTone, statusTone } from "@/lib/ui/tones";

export default async function DashboardPage() {
  const user = await requireSession();
  const metrics = dashboardMetrics(user.organizationId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan">Risk command centre</p>
        <h1 className="mt-2 text-3xl font-semibold">Overview</h1>
        <p className="mt-2 text-muted">AI investigates. Humans decide.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Open disputes" value={formatCompactInr(metrics.openAmount)} hint={`${metrics.openCount} cases`} />
        <Kpi label="Amount at risk" value={formatCompactInr(metrics.amountAtRisk)} />
        <Kpi label="Contest-ready" value={String(metrics.contestReady)} />
        <Kpi label="Action required" value={String(metrics.actionRequired)} />
        <Kpi label="Recovered this month" value={formatCompactInr(metrics.recovered)} />
        <Kpi label="Win rate" value={`${metrics.winRate}%`} />
      </div>

      <DashboardCharts
        volume={metrics.volume}
        reasons={metrics.reasons}
        strength={metrics.strengthBuckets}
        funnel={[
          { name: "Received", value: metrics.received },
          { name: "Investigated", value: metrics.investigated },
          { name: "Contest recommended", value: metrics.contestRecommended },
          { name: "Submitted", value: metrics.submitted },
          { name: "Won", value: metrics.won },
        ]}
        escalation={metrics.humanEscalationRate}
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">Recent cases</h2>
          <Link href="/disputes" className="text-sm text-cyan">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2">ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Evidence</th>
                <th>AI</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recent.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="py-3">
                    <Link href={`/disputes/${item.id}`} className="text-cyan">
                      {item.id.replace("disp_", "")}
                    </Link>
                  </td>
                  <td>{item.customer?.name ?? "—"}</td>
                  <td>{formatInr(item.amount)}</td>
                  <td className="capitalize">{item.reasonDescription}</td>
                  <td>{item.recommendation?.score ?? "—"}</td>
                  <td>
                    <Badge tone={recommendationTone(item.recommendation?.finalRecommendation)}>{item.recommendation?.finalRecommendation ?? "pending"}</Badge>
                  </td>
                  <td>{item.respondBy ? item.respondBy.slice(0, 10) : "—"}</td>
                  <td>
                    <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Card>
  );
}
