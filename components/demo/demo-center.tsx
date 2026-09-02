"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/motion/primitives";

const CARDS = [
  {
    id: "hero",
    kicker: "Hero case",
    title: "₹60,000 MacBook Air",
    body: "Product not received. BlueDart + chat acknowledgement. Strong evidence.",
    json: { event: "payment.dispute.created", amount: 6000000, reason: "product_not_received" },
    theme: "from-emerald-50 to-white",
  },
  {
    id: "weak",
    kicker: "Weak file",
    title: "Thin shipping evidence",
    body: "Rules should push this to human review.",
    json: { event: "payment.dispute.created", amount: 1500000, reason: "product_not_received" },
    theme: "from-amber-50 to-white",
  },
  {
    id: "random",
    kicker: "Fraud signal",
    title: "Unrecognized transaction",
    body: "Random replay for a high-risk claim pattern.",
    json: { event: "payment.dispute.action_required", reason: "transaction_not_recognised" },
    theme: "from-red-50 to-white",
  },
  {
    id: "service",
    kicker: "Missing POD",
    title: "No delivery proof",
    body: "Service-not-provided file without a clean proof of delivery.",
    json: { event: "payment.dispute.created", reason: "service_not_provided" },
    theme: "from-cyan/10 to-surface",
  },
  {
    id: "conflict",
    kicker: "Contradiction",
    title: "Conflicting customer chat",
    body: "Delivery exists but the conversation disagrees with itself.",
    json: { event: "payment.dispute.created", reason: "product_not_received" },
    theme: "from-violet/10 to-surface",
  },
] as const;

export function DemoCenter() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <Stagger className="grid gap-4 md:grid-cols-2">
      {CARDS.map((card) => (
        <StaggerItem key={card.id}>
        <motion.article
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className={cn("rounded-[14px] bg-gradient-to-br p-5 hairline", card.theme, busy === card.id && "scan-ai")}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber">Webhook-shaped demo event</div>
          <div className="mt-2 text-xs font-medium text-violet">{card.kicker}</div>
          <h2 className="mt-1 text-lg font-semibold">{card.title}</h2>
          <p className="mt-1 text-sm text-muted">{card.body}</p>
          <pre className="mt-3 overflow-auto rounded-[10px] bg-[#101828] p-3 text-[11px] text-slate-200">
            {JSON.stringify(card.json, null, 2)}
          </pre>
          <Button
            className="mt-4"
            disabled={Boolean(busy)}
            onClick={async () => {
              setBusy(card.id);
              const response = await fetch("/api/demo/replay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scenario: card.id }),
              });
              const data = await response.json();
              setBusy(null);
              if (!response.ok) {
                toast.error("Replay failed");
                return;
              }
              toast.success("Simulated webhook ingested. Opening the case.");
              window.dispatchEvent(new Event("ds-notifications-refresh"));
              if (data.disputeId) window.setTimeout(() => router.push(`/disputes/${data.disputeId}`), 700);
              else router.refresh();
            }}
          >
            {busy === card.id ? "Firing webhook…" : "Replay webhook"}
            <ArrowRight className={cn("size-4", busy === card.id && "animate-pulse")} />
          </Button>
        </motion.article>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
