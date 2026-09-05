"use client";

import { motion } from "motion/react";
import type { CaseBundle } from "@/types/case";
import { CopyId } from "@/components/ui/copy-id";
import { recommendationLabel } from "@/lib/ui/labels";
import { toRazorpayReasonCode } from "@/lib/razorpay/reason-codes";
import { cn, formatInr } from "@/lib/utils";
import { formatShortDate } from "@/lib/ui/dates";

const TINT: Record<string, string> = {
  Payment: "bg-cyan/10",
  "Razorpay dispute": "bg-cyan/10",
  Order: "bg-cyan/10",
  Invoice: "bg-cyan/10",
  Email: "bg-violet/10",
  Phone: "bg-violet/10",
  City: "bg-violet/10",
  Address: "bg-violet/10",
  Tracking: "bg-emerald/10",
  Carrier: "bg-emerald/10",
  Shipment: "bg-emerald/10",
  Delivered: "bg-emerald/10",
  Recipient: "bg-emerald/10",
  Score: "bg-amber/10",
  AI: "bg-violet/10",
  Rules: "bg-cyan/10",
  Confidence: "bg-violet/10",
};

export function FineDetails({ bundle, score, evidenceCount }: { bundle: CaseBundle; score: number; evidenceCount: number }) {
  const rec = bundle.recommendation;
  const items = [
    ["Payment", bundle.payment?.razorpayPaymentId],
    ["Razorpay dispute", bundle.dispute.razorpayDisputeId],
    ["Order", bundle.order?.externalId],
    ["Reason code", toRazorpayReasonCode(bundle.dispute.reasonCode)],
    ["Method", bundle.payment?.method ? `${bundle.payment.method}${bundle.payment.captured ? " · captured" : ""}` : undefined],
    ["Email", bundle.customer?.email],
    ["Phone", bundle.customer?.phone],
    ["City", bundle.order?.shippingAddress.city],
    ["Address", bundle.order?.shippingAddress.line1],
    ["Tracking", bundle.shipment?.trackingId],
    ["Carrier", bundle.shipment?.provider],
    ["Shipment", bundle.shipment?.status?.replaceAll("_", " ")],
    ["Delivered", bundle.shipment?.deliveredAt ? `${bundle.shipment.deliveryLocation ?? ""} ${formatShortDate(bundle.shipment.deliveredAt)}`.trim() : undefined],
    ["Recipient", bundle.shipment?.recipientName],
    ["Invoice", bundle.invoice?.invoiceNumber],
    ["SKU", bundle.products[0]?.sku],
    ["Refunded", bundle.refunds.length ? formatInr(bundle.refunds.reduce((sum, item) => sum + item.amount, 0)) : undefined],
    ["Evidence", `${evidenceCount} on file · ${bundle.evidence.filter((item) => item.verified).length} verified`],
    ["Score", `${score}/100`],
    ["AI", recommendationLabel(rec?.modelRecommendation)],
    ["Rules", recommendationLabel(rec?.rulesRecommendation)],
    ["Confidence", rec ? `${Math.round(rec.confidence * 100)}%` : undefined],
  ].filter(([, value]) => value);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
      {items.map(([label, value], index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -2, scale: 1.03 }}
          transition={{ delay: 0.03 * index, type: "spring", stiffness: 320, damping: 24 }}
          className={cn("rounded-full px-2.5 py-1 text-[11px] hairline", (label && TINT[label]) || "bg-surface")}
        >
          <span className="mr-1.5 text-muted">{label}</span>
          {/^(pay_|disp_|ORD-|INV-|BD|order_)/.test(String(value)) ? (
            <CopyId value={String(value)} className="inline text-[11px] text-foreground" />
          ) : (
            <span className="font-medium">{value}</span>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
