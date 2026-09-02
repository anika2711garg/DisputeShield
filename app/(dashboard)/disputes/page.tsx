import { Suspense } from "react";
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { listDisputes } from "@/lib/services/dispute-service";
import { DisputeFilters } from "@/components/disputes/filters";
import { DisputeTable } from "@/components/disputes/table";

const PAGE_SIZE = 10;

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireSession();
  const params = await searchParams;
  const items = listDisputes(user.organizationId, {
    q: params.q,
    status: params.status,
    reason: params.reason,
    recommendation: params.recommendation,
    phase: params.phase,
    view: params.view,
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
    recommendation: item.recommendation?.finalRecommendation,
    confidence: item.recommendation?.confidence,
    respondBy: item.respondBy,
    status: item.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Disputes</h1>
          <p className="mt-2 text-muted">{items.length} cases in this view</p>
        </div>
      </div>
      <Suspense>
        <DisputeFilters />
      </Suspense>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-surface p-12 text-center hairline">
          <p className="text-lg font-medium">No disputes yet.</p>
          <p className="mt-2 text-muted">Connect Razorpay or replay a demo dispute.</p>
          <Link href="/demo" className="mt-4 inline-block text-cyan">
            Open Demo Center
          </Link>
        </div>
      ) : (
        <DisputeTable rows={rows} total={items.length} />
      )}
    </div>
  );
}
