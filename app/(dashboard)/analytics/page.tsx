import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { analyticsPage } from "@/lib/services/analytics-service";
import { formatCompactInr } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { DashboardCharts } from "@/components/dashboard/charts";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireSession();
  const params = await searchParams;
  const range = params.range ?? "30";
  const data = analyticsPage(user.organizationId);
  const volume = range === "7" ? data.volume.slice(-7) : range === "90" ? data.volume : data.volume.slice(-14);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Analytics"
        description="Volume, amounts disputed, evidence strength, and the contest funnel — presentation-ready."
        actions={
          <div className="flex gap-2">
            {[
              ["7", "7 days"],
              ["30", "30 days"],
              ["90", "90 days"],
            ].map(([id, label]) => (
              <Link
                key={id}
                href={`/analytics?range=${id}`}
                data-active={range === id ? "true" : "false"}
                className="paper-tab rounded-[4px] px-3 py-1 text-xs"
              >
                {label}
              </Link>
            ))}
          </div>
        }
      />
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Disputes received" value={String(data.received)} />
        <MetricCard label="Amount disputed" value={formatCompactInr(data.amountDisputed)} />
        <MetricCard label="Amount contested" value={formatCompactInr(data.amountContested)} />
        <MetricCard label="Amount won" value={formatCompactInr(data.amountWon)} />
        <MetricCard label="Win rate" value={`${data.winRate}%`} />
        <MetricCard label="Median evidence score" value={String(data.medianScore)} />
        <MetricCard label="Human review" value={`${data.humanReviewPct}%`} />
        <MetricCard label="Recovered" value={formatCompactInr(data.recovered)} />
      </div>
      <DashboardCharts
        volume={volume}
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
