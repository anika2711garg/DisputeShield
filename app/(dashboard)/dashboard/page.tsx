import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { dashboardMetrics } from "@/lib/services/analytics-service";
import { formatCompactInr, formatInr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardCharts } from "@/components/dashboard/charts";
import { displayStatus, recommendationTone } from "@/lib/ui/labels";
import { statusTone } from "@/lib/ui/tones";
import { formatRelativeTo, formatShortDate, deadlineUrgency } from "@/lib/ui/dates";
import { CaseRowPeek } from "@/components/dashboard/case-row-peek";
import { PeekButton } from "@/components/ui/case-peek";
import { EmptyWorkspace } from "@/components/dashboard/empty-workspace";
import { canManageTeam } from "@/lib/auth/permissions";
import { onboardingProgress } from "@/lib/services/onboarding-service";
import { emitDeadlineAlerts } from "@/lib/services/ops-service";
import { OnboardingChecklist } from "@/components/settings/onboarding-checklist";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  emitDeadlineAlerts(user.organizationId);
  const metrics = dashboardMetrics(user.organizationId);
  const spark = metrics.volume.map((item) => item.count);
  const onboarding = onboardingProgress(user.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="this morning's desk"
        title="Amount at risk, right now"
        description="Prioritize files that can still be contested before the processor deadline. AI investigates. Humans decide."
      />
      {metrics.received === 0 && <EmptyWorkspace canLoadDemo={canManageTeam(user.role)} />}
      {metrics.received === 0 && !onboarding.complete && (
        <OnboardingChecklist steps={onboarding.steps} done={onboarding.done} total={onboarding.total} />
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard size="lg" delay={0} label="Amount at Risk" value={formatCompactInr(metrics.amountAtRisk)} delta={metrics.volumeDelta} tone="danger" spark={spark} hint={`${metrics.openCount} open cases`} peek="Open + action-required + under review. Won and lost files drop out of this number." />
        <MetricCard delay={0.06} label="Contest Ready" value={String(metrics.contestReady)} hint="Rules recommend contest" tone="emerald" spark={spark} peek="Rules score ≥ threshold and no critical evidence is missing. A human still has to submit." />
        <MetricCard delay={0.12} label="Response Deadlines" value={String(metrics.upcomingDeadlines.length)} tone="amber" hint="Need a reviewer this week" peek="Processor respond-by in the next 7 days. Hover a row in the priority queue to peek the file." />
        <MetricCard delay={0.18} label="Win Rate" value={`${metrics.winRate}%`} hint={`${metrics.won} won · ${metrics.lost} lost`} tone="cyan" peek="Won ÷ (won + lost). Simulated contests do not count as a Razorpay win." />
        <MetricCard delay={0.22} label="AI ≠ Rules" value={String(metrics.disagreements)} hint="Disagreements need a human" tone="ai" peek="The model and the TypeScript rules recommended different actions. Final stays human_review." />
        <MetricCard delay={0.26} label="Unassigned" value={String(metrics.unassigned)} hint="Open the assignment queue" tone="amber" peek="Open files with no reviewer owner. Claim next picks the earliest deadline." />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/queue" className="ticket rounded-[4px] px-3 py-2 text-sm">
          Assignment queue
        </Link>
        <Link href="/webhooks" className="ticket rounded-[4px] px-3 py-2 text-sm">
          Razorpay webhooks
        </Link>
        <Link href="/lab" className="ticket rounded-[4px] px-3 py-2 text-sm">
          Threshold lab
        </Link>
        <Link href="/disputes?view=disagreement" className="ticket rounded-[4px] px-3 py-2 text-sm">
          Review disagreements
        </Link>
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

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="flutter bg-gradient-to-br from-amber/10 to-surface">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="hand text-xl text-violet">priority queue</h2>
            <Link href="/disputes?view=needs-attention" className="text-sm text-electric">
              Open queue
            </Link>
          </div>
          <div className="space-y-1.5">
            {metrics.upcomingDeadlines.map((item) => {
              const urgency = deadlineUrgency(item.respondBy);
              return (
                <CaseRowPeek
                  key={item.id}
                  id={item.id}
                  seed={{
                    id: item.id,
                    amount: item.amount,
                    reason: item.reasonDescription,
                    status: item.status,
                    customerName: item.customer?.name,
                    respondBy: item.respondBy,
                    score: item.recommendation?.score,
                    ai: item.recommendation?.modelRecommendation,
                    rules: item.recommendation?.rulesRecommendation,
                  }}
                >
                  <Link href={`/disputes/${item.id}`} className="row-ink flex items-center justify-between rounded-[4px] px-2.5 py-2">
                    <div>
                      <div className="text-sm font-medium">{item.customer?.name ?? item.id}</div>
                      <div className="text-xs text-muted">{formatInr(item.amount)} · {item.reasonDescription}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs ${urgency === "urgent" || urgency === "overdue" ? "text-danger" : "text-amber"}`}>
                      <span className={`size-1.5 rounded-full ${urgency === "urgent" || urgency === "overdue" ? "bg-danger pulse-dot" : "bg-amber"}`} />
                      {item.respondBy ? formatRelativeTo(item.respondBy) : "—"}
                    </span>
                  </Link>
                </CaseRowPeek>
              );
            })}
          </div>
        </Card>
        <Card className="flutter">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="hand text-xl text-violet">recent files</h2>
            <Link href="/disputes" className="text-sm text-electric">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="ledger w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 text-[10px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="py-2">Case</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Score</th>
                  <th>AI</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent.map((item) => {
                  const label = displayStatus({
                    status: item.status,
                    phase: item.phase,
                    recommendation: item.recommendation?.finalRecommendation,
                  });
                  return (
                    <tr key={item.id} className="row-ink border-t">
                      <td className="py-2.5">
                        <div className="flex items-center gap-1">
                          <PeekButton
                            id={item.id}
                            seed={{
                              id: item.id,
                              amount: item.amount,
                              reason: item.reasonDescription,
                              status: item.status,
                              customerName: item.customer?.name,
                              score: item.recommendation?.score,
                            }}
                          />
                          <CaseRowPeek
                            id={item.id}
                            seed={{
                              id: item.id,
                              amount: item.amount,
                              reason: item.reasonDescription,
                              status: item.status,
                              customerName: item.customer?.name,
                              score: item.recommendation?.score,
                              ai: item.recommendation?.modelRecommendation,
                              rules: item.recommendation?.rulesRecommendation,
                              respondBy: item.respondBy,
                            }}
                          >
                            <Link href={`/disputes/${item.id}`} className="text-electric">
                              {item.id.replace("disp_", "")}
                            </Link>
                          </CaseRowPeek>
                        </div>
                      </td>
                      <td>
                        <CaseRowPeek id={item.id} seed={{ id: item.id, amount: item.amount, reason: item.reasonDescription, status: item.status, customerName: item.customer?.name }}>
                          <span>{item.customer?.name ?? "—"}</span>
                        </CaseRowPeek>
                      </td>
                      <td className="tabular">{formatInr(item.amount)}</td>
                      <td className="tabular">{item.recommendation?.score ?? "—"}</td>
                      <td>
                        <Badge tone={recommendationTone(item.recommendation?.modelRecommendation)}>{item.recommendation?.modelRecommendation ?? "pending"}</Badge>
                      </td>
                      <td>{formatShortDate(item.respondBy)}</td>
                      <td>
                        <Badge tone={statusTone(label)}>{label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
