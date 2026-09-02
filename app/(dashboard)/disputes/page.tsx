import { Suspense } from "react";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { listDisputes } from "@/lib/services/dispute-service";
import { DisputeFilters } from "@/components/disputes/filters";
import { DisputeTable } from "@/components/disputes/table";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

const PAGE_SIZE = 10;

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireSession();
  const params = await searchParams;
  let items = listDisputes(user.organizationId, {
    q: params.q,
    status: params.status,
    reason: params.reason,
    recommendation: params.recommendation,
    phase: params.phase,
    view: params.view,
    minScore: params.minScore ? Number(params.minScore) : undefined,
    rangeDays: params.range ? Number(params.range) : undefined,
  });
  const sort = params.sort ?? "deadline";
  const dir = params.dir === "asc" ? 1 : -1;
  items = [...items].sort((a, b) => {
    const av = sortValue(a, sort);
    const bv = sortValue(b, sort);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
  const requested = Math.max(1, Number(params.page ?? "1") || 1);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(requested, pages);
  const start = (page - 1) * PAGE_SIZE;
  const rows = items.slice(start, start + PAGE_SIZE).map((item) => ({
    id: item.id,
    paymentId: item.payment?.razorpayPaymentId,
    customerName: item.customer?.name,
    customerEmail: item.customer?.email,
    amount: item.amount,
    reason: item.reasonDescription,
    phase: item.phase,
    score: item.recommendation?.score,
    aiRecommendation: item.recommendation?.modelRecommendation,
    rulesRecommendation: item.recommendation?.rulesRecommendation,
    recommendation: item.recommendation?.finalRecommendation,
    confidence: item.recommendation?.confidence,
    respondBy: item.respondBy,
    status: item.status,
    reviewer: item.rawData.hero === true ? "Aanya Mehta" : undefined,
    razorpayDisputeId: item.razorpayDisputeId,
    evidenceCount: item.evidenceCount,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Queue"
        title="Disputes"
        description={`Investigate, prioritize, and resolve ${items.length} payment disputes before their response deadlines.`}
      />
      <Suspense>
        <DisputeFilters />
      </Suspense>
      {items.length === 0 ? (
        <EmptyState
          title="No disputes yet."
          body="Connect Razorpay or replay a demo dispute."
          action={
            <Link href="/demo" className="text-sm text-cyan">
              Open Demo Center
            </Link>
          }
        />
      ) : (
        <DisputeTable rows={rows} total={items.length} />
      )}
    </div>
  );
}

function sortValue(item: ReturnType<typeof listDisputes>[number], sort: string): string | number {
  if (sort === "amount") return item.amount;
  if (sort === "score") return item.recommendation?.score ?? -1;
  if (sort === "customer") return item.customer?.name ?? "";
  if (sort === "reason") return item.reasonDescription;
  if (sort === "status") return item.status;
  if (sort === "ai") return item.recommendation?.modelRecommendation ?? "";
  if (sort === "rules") return item.recommendation?.rulesRecommendation ?? "";
  if (sort === "deadline") return item.respondBy ?? "";
  return item.id;
}
