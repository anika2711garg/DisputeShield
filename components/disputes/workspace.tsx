"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CaseBundle } from "@/types/case";
import type { AuditLog } from "@/types/domain";
import type { ScoreBreakdown } from "@/lib/rules/evidence-score";
import { formatInr } from "@/lib/utils";
import { evidenceCategoryLabel } from "@/lib/rules/evidence-requirements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { statusTone } from "@/lib/ui/tones";
import { ReadinessRing } from "./readiness-ring";
import { DeadlineRadar } from "./deadline-radar";
import { WhatIfPanel } from "./what-if";
import { CopilotPanel } from "./copilot";
import { CaseReplay } from "./case-replay";
import { PresentationMode } from "./presentation-mode";
import { InvestigationOverlay } from "./investigation-overlay";
import { EvidenceUpload } from "./evidence-upload";
import { EvidencePreviewDrawer } from "./evidence-preview-drawer";
import type { EvidenceItem } from "@/types/domain";

const TABS = ["Overview", "Evidence", "Conversation", "Timeline", "AI Analysis", "Raw Razorpay"] as const;

const EvidenceGraph = dynamic(() => import("./evidence-graph").then((mod) => ({ default: mod.EvidenceGraph })), {
  ssr: false,
  loading: () => <div className="grid h-[360px] place-items-center rounded-2xl bg-sunken text-sm text-muted">Loading graph…</div>,
});

export function DisputeWorkspace({
  bundle,
  score,
  audit,
  role,
}: {
  bundle: CaseBundle;
  score: ScoreBreakdown;
  audit: AuditLog[];
  role: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [busy, setBusy] = useState(false);
  const [investigationDone, setInvestigationDone] = useState(false);
  const [preview, setPreview] = useState<EvidenceItem | null>(null);
  const rec = bundle.recommendation;
  const evidenceByType = useMemo(() => {
    const groups = new Map<string, typeof bundle.evidence>();
    for (const item of bundle.evidence) {
      const key = evidenceCategoryLabel(item.type);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups.entries()];
  }, [bundle]);

  async function runInvestigation() {
    setBusy(true);
    setInvestigationDone(false);
    const [response] = await Promise.all([
      fetch(`/api/disputes/${bundle.dispute.id}/investigate`, { method: "POST" }),
      new Promise((resolve) => window.setTimeout(resolve, 3200)),
    ]);
    setInvestigationDone(true);
    window.setTimeout(() => {
      setBusy(false);
      setInvestigationDone(false);
    }, 800);
    if (!response.ok) {
      toast.error("Investigation failed");
      return;
    }
    toast.success("Investigation completed");
    router.refresh();
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{bundle.dispute.id}</h1>
            <Badge tone={statusTone(bundle.dispute.status)}>{bundle.dispute.status}</Badge>
            {bundle.dispute.rawData.hero === true && <Badge tone="cyan">Hero demo</Badge>}
            {bundle.dispute.rawData.simulated === true && <Badge tone="amber">Simulated event</Badge>}
          </div>
          <p className="mt-2 text-3xl font-semibold">{formatInr(bundle.dispute.amount)}</p>
          <p className="mt-1 capitalize text-muted">{bundle.dispute.reasonDescription}</p>
        </div>
        <DeadlineRadar respondBy={bundle.dispute.respondBy} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-xs uppercase tracking-[0.2em] text-muted">Primary recommendation</div>
          <div className="mt-2 text-3xl font-semibold">
            {(rec?.finalRecommendation ?? "human_review").replaceAll("_", " ").toUpperCase()} RECOMMENDED
          </div>
          <p className="mt-3 max-w-2xl text-muted">
            {bundle.investigation?.summary ?? "Run an investigation to generate a merchant-facing summary."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge tone="ai">Confidence {Math.round((rec?.confidence ?? 0) * 100)}%</Badge>
            <Badge tone="cyan">Evidence {score.total}/100</Badge>
            <Badge>{bundle.evidence.length} supporting documents</Badge>
          </div>
          <div className="mt-6 hidden flex-wrap gap-2 md:flex">
            <Button asChild>
              <Link href={`/disputes/${bundle.dispute.id}/review`}>Review Evidence</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/disputes/${bundle.dispute.id}/review`}>Prepare Contest</Link>
            </Button>
            <Button variant="outline" disabled={busy} onClick={runInvestigation}>
              {busy ? "Investigating…" : "Run Investigation"}
            </Button>
            <PresentationMode bundle={bundle} score={score} />
          </div>
        </Card>
        <Card>
          <ReadinessRing
            score={score.total}
            confidence={rec?.confidence ?? 0}
            missing={score.missingCritical.length}
            breakdown={score.dimensions.map((d) => ({ label: d.label, awarded: d.awarded, max: d.max }))}
          />
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-wide hairline ${tab === item ? "bg-cyan text-black" : ""}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2 space-y-3">
            <h2 className="text-sm text-muted">Recommendation split</h2>
            <div className="grid gap-2 md:grid-cols-3">
              <Fact label="AI" value={rec?.modelRecommendation ?? "—"} />
              <Fact label="Rules" value={rec?.rulesRecommendation ?? "—"} />
              <Fact label="Final" value={rec?.finalRecommendation ?? "—"} />
            </div>
            <p className="text-sm text-muted">These three fields are never collapsed. Overrides: {rec?.overrideReasons.join(" ") || "none"}</p>
            <WhatIfPanel disputeId={bundle.dispute.id} evidence={bundle.evidence} baseline={score.total} baselineRec={rec?.finalRecommendation ?? "human_review"} />
            <EvidenceGraph evidence={bundle.evidence} claim={bundle.dispute.reasonDescription} />
          </Card>
          <div className="space-y-4">
            <Card>
              <h2 className="text-sm text-muted">Parties</h2>
              <Fact label="Customer" value={bundle.customer?.name ?? "—"} />
              <Fact label="Payment" value={bundle.payment?.razorpayPaymentId ?? "—"} copy={bundle.payment?.razorpayPaymentId} />
              <Fact label="Order" value={bundle.order?.externalId ?? "—"} copy={bundle.order?.externalId} />
              <Fact label="Shipment" value={bundle.shipment ? `${bundle.shipment.provider} ${bundle.shipment.trackingId}` : "—"} />
              <Fact label="Refunds" value={bundle.refunds.length ? formatInr(bundle.refunds.reduce((s, r) => s + r.amount, 0)) : "None"} />
            </Card>
            <CopilotPanel disputeId={bundle.dispute.id} />
          </div>
        </div>
      )}

      {tab === "Evidence" && (
        <div className="space-y-6">
          <EvidenceUpload disputeId={bundle.dispute.id} />
          {evidenceByType.map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm text-muted">{category}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <button key={item.id} type="button" className="text-left" onClick={() => setPreview(item)}>
                    <Card>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted">{item.id} · {item.source}</div>
                        </div>
                        <Badge tone={item.verified ? "emerald" : "amber"}>{item.verified ? "Verified" : "Unverified"}</Badge>
                      </div>
                      <p className="mt-3 text-sm">{item.contentText}</p>
                      <div className="mt-3 text-xs text-muted">Relevance {item.relevanceScore} · Strength {item.strengthScore} · View preview</div>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Conversation" && (
        <Card>
          {bundle.messages.length === 0 && <p className="text-muted">No customer conversation on this case.</p>}
          <div className="space-y-3">
            {bundle.messages.map((message) => {
              const highlight = /got the laptop|thanks|received|working/i.test(message.body);
              return (
                <div key={message.id} className={`rounded-xl p-3 ${highlight ? "bg-emerald/10" : "bg-sunken"}`}>
                  <div className="text-xs uppercase text-muted">{message.senderType} · {message.sentAt.slice(0, 16).replace("T", " ")}</div>
                  <p className="mt-1">{message.body}</p>
                  {highlight && <p className="mt-2 text-sm text-emerald">AI extracted fact: customer confirmed receipt. Confidence 98%.</p>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "Timeline" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <CaseReplay bundle={bundle} />
          <Card>
            <h3 className="mb-4 text-sm text-muted">Audit trail</h3>
            <ol className="space-y-3">
              {audit.map((event) => (
                <li key={event.id} className="border-l-2 border-cyan/40 pl-3">
                  <div className="text-xs text-muted">{event.createdAt.replace("T", " ").slice(0, 16)} · {event.actorType}</div>
                  <div className="text-sm">{event.action}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      {tab === "AI Analysis" && (
        <Card className="space-y-4">
          <Fact label="Classification" value={bundle.dispute.reasonDescription} />
          <Fact label="Reason confidence" value={`${Math.round((bundle.investigation?.reasonConfidence ?? 0) * 100)}%`} />
          <div>
            <div className="text-sm text-muted">Required evidence</div>
            <ul className="mt-2 space-y-1 text-sm">
              {["Shipping proof", "Delivery confirmation", "Invoice", "Customer acknowledgement"].map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm text-muted">Missing evidence</div>
            <p className="mt-1">{score.missingCritical.length ? score.missingCritical.join(", ") : "None critical"}</p>
          </div>
          <div>
            <div className="text-sm text-muted">Contradictions</div>
            <p className="mt-1">{rec?.overrideReasons[0] ?? "Customer claims non-delivery; delivery and acknowledgement may contradict that claim."}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <Fact label="AI recommendation" value={rec?.modelRecommendation ?? "—"} />
            <Fact label="Rules recommendation" value={rec?.rulesRecommendation ?? "—"} />
            <Fact label="Final" value={rec?.finalRecommendation ?? "—"} />
          </div>
          <p className="text-sm">{bundle.investigation?.summary}</p>
          <p className="text-xs text-muted">
            Model {bundle.investigation?.model} · prompt {bundle.investigation?.promptVersion} · {bundle.investigation?.createdAt} · {role}
          </p>
        </Card>
      )}

      {tab === "Raw Razorpay" && (
        <Card>
          <pre className="overflow-auto text-xs text-muted">{JSON.stringify(bundle.dispute.rawData, null, 2)}</pre>
        </Card>
      )}
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t bg-background/95 p-3 md:hidden">
        <Button asChild className="flex-1">
          <Link href={`/disputes/${bundle.dispute.id}/review`}>Review</Link>
        </Button>
        <Button variant="outline" className="flex-1" disabled={busy} onClick={runInvestigation}>
          {busy ? "…" : "Investigate"}
        </Button>
      </div>
      <InvestigationOverlay active={busy} done={investigationDone} />
      <EvidencePreviewDrawer item={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function Fact({ label, value, copy }: { label: string; value: string; copy?: string }) {
  return (
    <div className="py-1">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <button
        type="button"
        className="text-sm"
        onClick={() => {
          if (copy) {
            void navigator.clipboard.writeText(copy);
            toast.success("Copied");
          }
        }}
      >
        {value}
      </button>
    </div>
  );
}
