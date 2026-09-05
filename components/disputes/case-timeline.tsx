import type { CaseBundle } from "@/types/case";
import type { AuditLog } from "@/types/domain";
import { formatAbsolute } from "@/lib/ui/dates";
import { actorKind } from "@/lib/ui/labels";

export function CaseTimeline({ bundle, audit }: { bundle: CaseBundle; audit: AuditLog[] }) {
  const events = [
    { t: bundle.payment?.createdAt, label: "Payment captured", kind: "system" as const },
    { t: bundle.order?.createdAt, label: "Order placed", kind: "system" as const },
    { t: bundle.shipment?.shippedAt, label: "Order shipped", kind: "system" as const },
    { t: bundle.shipment?.deliveredAt, label: `Delivered in ${bundle.shipment?.deliveryLocation ?? "destination"}`, kind: "system" as const },
    {
      t: bundle.messages.find((item) => /got the laptop|thanks|received/i.test(item.body))?.sentAt,
      label: "Customer acknowledgement found",
      kind: "ai" as const,
    },
    { t: bundle.dispute.createdAt, label: "Chargeback opened", kind: "system" as const },
    { t: bundle.evidence[0]?.createdAt, label: "Evidence collected", kind: "system" as const },
    { t: bundle.investigation?.createdAt, label: "AI summary generated", kind: "ai" as const },
    { t: new Date().toISOString(), label: "Waiting for reviewer", kind: "human" as const },
  ].filter((item): item is { t: string; label: string; kind: "ai" | "human" | "system" } => Boolean(item.t));

  return (
    <div className="sheet flutter rounded-[6px] p-5">
      <h3 className="hand text-xl text-violet">case timeline</h3>
      <ol className="mt-4 space-y-3">
        {events.map((event) => (
          <li key={`${event.label}-${event.t}`} className="flex gap-3">
            <span className={`mt-1 size-2.5 shrink-0 rounded-full ${event.kind === "ai" ? "bg-cyan" : event.kind === "human" ? "bg-amber" : "bg-muted"}`} />
            <div>
              <div className="text-sm font-medium">{event.label}</div>
              <div className="text-xs text-muted">{formatAbsolute(event.t)} · {event.kind}</div>
            </div>
          </li>
        ))}
      </ol>
      {audit.length > 0 && (
        <p className="mt-4 text-xs text-muted">{audit.length} append-only audit events on this case.</p>
      )}
    </div>
  );
}

export function actorDot(actorType: string) {
  const kind = actorKind(actorType);
  return kind === "ai" ? "bg-cyan" : kind === "human" ? "bg-amber" : "bg-muted";
}
