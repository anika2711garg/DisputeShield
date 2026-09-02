"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { CaseBundle } from "@/types/case";
import { Button } from "@/components/ui/button";

export function CaseReplay({ bundle }: { bundle: CaseBundle }) {
  const events = [
    { t: bundle.order?.createdAt, label: `Order ${bundle.order?.externalId} created` },
    { t: bundle.payment?.createdAt, label: `Payment captured ${bundle.payment?.razorpayPaymentId}` },
    { t: bundle.shipment?.shippedAt, label: `Shipment created ${bundle.shipment?.trackingId ?? ""}` },
    { t: bundle.shipment?.deliveredAt, label: `Package delivered ${bundle.shipment?.deliveryLocation ?? ""}` },
    ...bundle.messages.map((m) => ({ t: m.sentAt, label: `${m.senderType}: ${m.body}` })),
    { t: bundle.dispute.createdAt, label: "Dispute created" },
    { t: bundle.investigation?.createdAt, label: "AI investigation completed" },
  ].filter((item): item is { t: string; label: string } => Boolean(item.t));

  const [step, setStep] = useState(events.length);

  return (
    <div className="rounded-[var(--radius)] bg-surface p-5 hairline">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm text-muted">Replay case</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setStep(1)}>Replay</Button>
          <Button size="sm" variant="outline" onClick={() => setStep((v) => Math.min(events.length, v + 1))}>Next</Button>
        </div>
      </div>
      <ol className="space-y-3">
        {events.slice(0, step).map((event, index) => (
          <motion.li key={`${event.t}-${index}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="border-l-2 border-ai/50 pl-3">
            <div className="text-xs text-muted">{event.t.slice(0, 10)}</div>
            <div className="text-sm">{event.label}</div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
