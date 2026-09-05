"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RAZORPAY_DISPUTE_EVENTS } from "@/lib/razorpay/events";
import { PeekLink } from "@/components/ui/case-peek";
import { disputeIdFromWebhookPayload } from "@/lib/ui/peek";

type EventRow = {
  id: string;
  eventType: string;
  signatureValid: boolean;
  processed: boolean;
  processingError?: string;
  receivedAt: string;
  payload: Record<string, unknown>;
};

export function WebhookInbox({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [event, setEvent] = useState<(typeof RAZORPAY_DISPUTE_EVENTS)[number]>("payment.dispute.created");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="sheet flutter rounded-[6px] bg-gradient-to-br from-cyan/10 to-surface p-5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan">Razorpay webhook</div>
        <h2 className="mt-1 text-lg font-semibold">POST /api/webhooks/razorpay</h2>
        <p className="mt-1 text-sm text-muted">HMAC-SHA256 via x-razorpay-signature. Duplicate events are keyed by event + dispute + created_at.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <select
            className="h-10 rounded-[4px] bg-white px-3 text-sm hairline"
            value={event}
            onChange={(e) => setEvent(e.target.value as (typeof RAZORPAY_DISPUTE_EVENTS)[number])}
          >
            {RAZORPAY_DISPUTE_EVENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const response = await fetch("/api/webhooks/razorpay/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event }),
              });
              const data = await response.json();
              setBusy(false);
              if (!response.ok) {
                toast.error("Webhook failed");
                return;
              }
              toast.success(data.duplicate ? "Duplicate ignored" : "Webhook ingested");
              window.dispatchEvent(new Event("ds-notifications-refresh"));
              router.refresh();
              if (data.disputeId) router.push(`/disputes/${data.disputeId}`);
            }}
          >
            {busy ? "Firing…" : "Fire signed test event"}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {events.length === 0 && <p className="text-sm text-muted">No webhook events yet. Fire a test event or replay a Demo Center scenario.</p>}
        {events.map((item) => {
          const disputeId = disputeIdFromWebhookPayload(item.payload);
          return (
          <article key={item.id} className="sheet flutter rounded-[6px] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono text-sm">{item.eventType}</div>
                <div className="text-xs text-muted">{new Date(item.receivedAt).toLocaleString()}</div>
                {disputeId && (
                  <PeekLink id={disputeId} className="mt-1 inline-block text-xs text-electric">
                    Peek case {disputeId}
                  </PeekLink>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={item.signatureValid ? "emerald" : "danger"}>{item.signatureValid ? "HMAC valid" : "HMAC failed"}</Badge>
                <Badge tone={item.processed ? "cyan" : "amber"}>{item.processingError ?? (item.processed ? "processed" : "pending")}</Badge>
                <button type="button" className="text-xs text-electric" onClick={() => setOpen(open === item.id ? null : item.id)}>
                  {open === item.id ? "Hide" : "Inspect"}
                </button>
              </div>
            </div>
            {open === item.id && (
              <pre className="mt-3 overflow-auto rounded-[4px] bg-[#241c14] p-3 text-[11px] text-[#f4ead8]">{JSON.stringify(item.payload, null, 2)}</pre>
            )}
          </article>
          );
        })}
      </div>
    </div>
  );
}
