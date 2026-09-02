import { requireSession } from "@/lib/auth/session";
import { analyticsPage } from "@/lib/services/analytics-service";
import { formatCompactInr } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/charts";

export default async function AnalyticsPage() {
  const user = await requireSession();
  const data = analyticsPage(user.organizationId);
  const rows = [
    ["Disputes received", String(data.received)],
    ["Amount disputed", formatCompactInr(data.amountDisputed)],
    ["Amount contested", formatCompactInr(data.amountContested)],
    ["Amount accepted", formatCompactInr(data.amountAccepted)],
    ["Amount won", formatCompactInr(data.amountWon)],
    ["Amount lost", formatCompactInr(data.amountLost)],
    ["Potential recovered", formatCompactInr(data.recovered)],
    ["Median evidence score", String(data.medianScore)],
    ["Human review", `${data.humanReviewPct}%`],
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Analytics</h1>
      <div className="grid gap-3 md:grid-cols-3">
        {rows.map(([label, value]) => (
          <Card key={label}>
            <div className="text-xs uppercase text-muted">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>
      <DashboardCharts
        volume={data.volume}
        reasons={data.reasons}
        strength={data.strengthBuckets}
        funnel={[
          { name: "Received", value: data.received },
          { name: "Investigated", value: data.investigated },
          { name: "Contest recommended", value: data.contestRecommended },
          { name: "Submitted", value: data.submitted },
          { name: "Won", value: data.won },
        ]}
        escalation={data.humanEscalationRate}
      />
    </div>
  );
}
