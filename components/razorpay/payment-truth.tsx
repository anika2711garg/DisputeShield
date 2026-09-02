"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { CaseBundle } from "@/types/case";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toRazorpayReasonCode } from "@/lib/razorpay/reason-codes";

export function PaymentTruth({ bundle }: { bundle: CaseBundle }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const payment = bundle.payment;
  const match = payment ? Math.abs(payment.amount - bundle.dispute.amount) < 1 : false;

  return (
    <section className="rounded-[14px] bg-surface p-5 hairline">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan">Razorpay payment</div>
          <h3 className="mt-1 text-sm font-semibold">Source of truth</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const response = await fetch(`/api/disputes/${bundle.dispute.id}/refresh`, { method: "POST" });
            setBusy(false);
            if (!response.ok) {
              toast.error("Refresh failed");
              return;
            }
            toast.success("Pulled latest dispute from Razorpay adapter");
            router.refresh();
          }}
        >
          <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
          Sync
        </Button>
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <Row label="Payment" value={payment?.razorpayPaymentId ?? "—"} />
        <Row label="Order" value={payment?.razorpayOrderId ?? "—"} />
        <Row label="Dispute" value={bundle.dispute.razorpayDisputeId} />
        <Row label="Captured" value={payment?.captured ? "Yes" : "No"} />
        <Row label="Method" value={payment?.method ?? "—"} />
        <Row label="Amount" value={payment ? formatInr(payment.amount) : "—"} />
        <Row label="Claim" value={formatInr(bundle.dispute.amount)} />
        <Row label="Match" value={match ? "Payment equals claim" : "Mismatch — review"} />
        <Row label="Reason code" value={toRazorpayReasonCode(bundle.dispute.reasonCode)} />
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] bg-sunken/70 px-2.5 py-1.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-mono text-xs">{value}</dd>
    </div>
  );
}
