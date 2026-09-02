import "server-only";

import { getStore } from "@/lib/db/local-store";
import { listDisputes } from "./dispute-service";

export function dashboardMetrics(organizationId: string) {
  const disputes = listDisputes(organizationId);
  const open = disputes.filter((item) => ["open", "action_required", "under_review"].includes(item.status));
  const contestReady = disputes.filter((item) => item.recommendation?.finalRecommendation === "contest" && item.status !== "won" && item.status !== "lost");
  const actionRequired = disputes.filter((item) => item.status === "action_required");
  const won = disputes.filter((item) => item.status === "won");
  const lost = disputes.filter((item) => item.status === "lost");
  const recovered = won.reduce((sum, item) => sum + item.amount, 0);
  const atRisk = open.reduce((sum, item) => sum + item.amount, 0);
  const closed = won.length + lost.length;
  const winRate = closed ? Math.round((won.length / closed) * 100) : 0;

  const reasons = countBy(disputes.map((item) => item.reasonCode));
  const strengthBuckets = { strong: 0, medium: 0, weak: 0 };
  for (const item of disputes) {
    const score = item.recommendation?.score ?? 0;
    if (score >= 80) strengthBuckets.strong += 1;
    else if (score >= 50) strengthBuckets.medium += 1;
    else strengthBuckets.weak += 1;
  }

  return {
    openCount: open.length,
    openAmount: open.reduce((sum, item) => sum + item.amount, 0),
    amountAtRisk: atRisk,
    contestReady: contestReady.length,
    actionRequired: actionRequired.length,
    recovered,
    winRate,
    received: disputes.length,
    investigated: disputes.filter((item) => item.investigation).length,
    contestRecommended: disputes.filter((item) => item.recommendation?.finalRecommendation === "contest").length,
    submitted: disputes.filter((item) => item.phase === "submitted" || item.status === "under_review").length,
    won: won.length,
    lost: lost.length,
    humanEscalationRate: disputes.length
      ? Math.round((disputes.filter((item) => item.recommendation?.finalRecommendation === "human_review").length / disputes.length) * 100)
      : 0,
    reasons,
    strengthBuckets,
    recent: disputes.slice(0, 8),
    volume: lastNDays(disputes.map((item) => item.createdAt), 14),
    upcomingDeadlines: disputes
      .filter((item) => item.respondBy && new Date(item.respondBy).getTime() > Date.now() - 86_400_000)
      .sort((a, b) => (a.respondBy ?? "").localeCompare(b.respondBy ?? ""))
      .slice(0, 6),
    volumeDelta: weekDelta(disputes.map((item) => item.createdAt)),
    disagreements: disputes.filter((item) => item.recommendation && item.recommendation.modelRecommendation !== item.recommendation.rulesRecommendation).length,
    unassigned: disputes.filter((item) => !item.assigneeId && !["won", "lost", "accepted", "closed"].includes(item.status)).length,
  };
}

export function analyticsPage(organizationId: string) {
  const metrics = dashboardMetrics(organizationId);
  const store = getStore();
  const disputes = listDisputes(organizationId);
  const contested = store.approvals.filter((item) => item.action === "contest" && item.organizationId === organizationId);
  const accepted = store.approvals.filter((item) => item.action === "accept" && item.organizationId === organizationId);
  return {
    ...metrics,
    amountDisputed: disputes.reduce((sum, item) => sum + item.amount, 0),
    amountContested: contested.length
      ? disputes.filter((item) => contested.some((a) => a.disputeId === item.id)).reduce((sum, item) => sum + item.amount, 0)
      : disputes.filter((item) => item.recommendation?.finalRecommendation === "contest").reduce((sum, item) => sum + item.amount, 0),
    amountAccepted: accepted.length
      ? disputes.filter((item) => accepted.some((a) => a.disputeId === item.id)).reduce((sum, item) => sum + item.amount, 0)
      : 0,
    amountWon: disputes.filter((item) => item.status === "won").reduce((sum, item) => sum + item.amount, 0),
    amountLost: disputes.filter((item) => item.status === "lost").reduce((sum, item) => sum + item.amount, 0),
    medianScore: median(disputes.map((item) => item.recommendation?.score ?? 0)),
    humanReviewPct: metrics.humanEscalationRate,
  };
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function lastNDays(dates: string[], days: number): { day: string; count: number }[] {
  const out: { day: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key.slice(5), count: dates.filter((value) => value.startsWith(key)).length });
  }
  return out;
}

function weekDelta(dates: string[]): number {
  const now = Date.now();
  const week = 7 * 86_400_000;
  const recent = dates.filter((value) => now - new Date(value).getTime() <= week).length;
  const previous = dates.filter((value) => {
    const age = now - new Date(value).getTime();
    return age > week && age <= week * 2;
  }).length;
  if (!previous) return recent ? 100 : 0;
  return Math.round(((recent - previous) / previous) * 100);
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? (sorted[mid] ?? 0) : Math.round(((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2);
}
