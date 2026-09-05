"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CaseBundle } from "@/types/case";
import type { AuditLog, EvidenceItem, UserRole } from "@/types/domain";
import type { ScoreBreakdown } from "@/lib/rules/evidence-score";
import { formatInr } from "@/lib/utils";
import { displayStatus } from "@/lib/ui/labels";
import { formatAbsolute, formatRelativeTo, deadlineUrgency } from "@/lib/ui/dates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyId } from "@/components/ui/copy-id";
import { statusTone } from "@/lib/ui/tones";
import { ReadinessRing } from "./readiness-ring";
import { DeadlineRadar } from "./deadline-radar";
import { WhatIfPanel } from "./what-if";
import { PresentationMode } from "./presentation-mode";
import { InvestigationOverlay } from "./investigation-overlay";
import { EvidenceUpload } from "./evidence-upload";
import { EvidencePreviewDrawer } from "./evidence-preview-drawer";
import { RecommendationCard } from "./recommendation-card";
import { HumanDecisionCard } from "./human-decision-card";
import { InvestigationPanel } from "./investigation-panel";
import { CaseTimeline } from "./case-timeline";
import { FineDetails } from "./fine-details";
import { PayloadPreview } from "@/components/razorpay/payload-preview";
import { PaymentTruth } from "@/components/razorpay/payment-truth";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { motion } from "motion/react";

const EvidenceGraph = dynamic(() => import("./evidence-graph").then((mod) => ({ default: mod.EvidenceGraph })), {
  ssr: false,
          loading: () => <div className="sheet grid h-[380px] place-items-center rounded-[6px] text-sm text-muted">Loading graph…</div>,
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
  const [busy, setBusy] = useState(false);
  const [investigationDone, setInvestigationDone] = useState(false);
  const [preview, setPreview] = useState<EvidenceItem | null>(null);
  const rec = bundle.recommendation;
  const statusLabel = displayStatus({
    status: bundle.dispute.status,
    phase: bundle.dispute.phase,
    recommendation: rec?.finalRecommendation,
  });
  const assignee = bundle.dispute.rawData.hero === true ? "Aanya Mehta" : "Unassigned";
  const urgency = deadlineUrgency(bundle.dispute.respondBy);
  const evidence = useMemo(() => bundle.evidence, [bundle]);

  async function runInvestigation() {
    setBusy(true);
    setInvestigationDone(false);
    const [response] = await Promise.all([
      fetch(`/api/disputes/${bundle.dispute.id}/investigate`, { method: "POST" }),
      new Promise((resolve) => window.setTimeout(resolve, 3400)),
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
    toast.success("Investigation complete");
    router.refresh();
  }

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyId value={bundle.dispute.id} className="display text-xl italic text-foreground" />
            <Badge tone={statusTone(statusLabel)}>{statusLabel}</Badge>
            {bundle.dispute.rawData.hero === true && <Badge tone="cyan">Hero demo</Badge>}
            {bundle.dispute.rawData.simulated === true && <Badge tone="amber">Simulated event</Badge>}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span>{bundle.customer?.name ?? "Unknown customer"}</span>
            <span className="capitalize">{bundle.dispute.reasonDescription}</span>
            <span>Assignee {assignee}</span>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="display mt-3 text-4xl italic tracking-tight tabular"
          >
            {formatInr(bundle.dispute.amount)} <span className="text-base font-medium text-muted">at risk</span>
          </motion.p>
          <div className="mt-3">
            <FineDetails bundle={bundle} score={score.total} evidenceCount={evidence.length} />
          </div>
        </div>
        <div className="text-right">
          <DeadlineRadar respondBy={bundle.dispute.respondBy} />
          {bundle.dispute.respondBy && (
            <p className={`mt-1 text-xs ${urgency === "urgent" || urgency === "overdue" ? "text-danger" : "text-muted"}`}>
              {formatRelativeTo(bundle.dispute.respondBy)} · {formatAbsolute(bundle.dispute.respondBy)}
            </p>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ticket flex items-center justify-between gap-3 rounded-[4px] bg-amber/10 px-4 py-2.5 text-sm text-amber"
      >
        <span className="font-medium">Evidence is strong. Human approval is required before contesting.</span>
        <span className="hidden text-xs md:inline">AI and rules are inputs — not authority.</span>
      </motion.div>

      <Stagger className="grid gap-3 md:grid-cols-3">
        <StaggerItem>
          <RecommendationCard kind="ai" title="AI Investigation" value={rec?.modelRecommendation} detail="Interpretation of conversation and claim language." />
        </StaggerItem>
        <StaggerItem>
          <RecommendationCard
            kind="rules"
            title="Rules Engine"
            value={rec?.rulesRecommendation}
            detail={`Evidence score: ${score.total}/100 · recalculated in code`}
          />
        </StaggerItem>
        <StaggerItem>
          <RecommendationCard kind="human" title="Final Decision" value="human_review" detail="Pending human review" />
        </StaggerItem>
      </Stagger>

      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <Button asChild>
          <Link href={`/disputes/${bundle.dispute.id}/review`}>Review</Link>
        </Button>
        <Button variant="outline" disabled={busy} onClick={runInvestigation}>
          {busy ? "Investigating…" : "Investigate"}
        </Button>
        <WhatIfPanel disputeId={bundle.dispute.id} evidence={bundle.evidence} baseline={score.total} baselineRec={rec?.finalRecommendation ?? "human_review"} />
        <PresentationMode bundle={bundle} score={score} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="sheet flutter rounded-[6px] p-5">
            <ReadinessRing
              score={score.total}
              confidence={rec?.confidence ?? 0}
              missing={score.missingCritical.length}
              breakdown={score.dimensions.map((d) => ({ label: d.label, awarded: d.awarded, max: d.max }))}
            />
          </section>
          <section className="sheet flutter rounded-[6px] p-5">
            <EvidenceGraph bundle={bundle} investigating={busy} />
          </section>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="hand text-xl text-violet">evidence slips</h3>
              <span className="text-xs text-muted">{evidence.length} items · include/exclude from contest</span>
            </div>
            <EvidenceUpload disputeId={bundle.dispute.id} />
            <div className="grid gap-3 md:grid-cols-2">
              {evidence.map((item) => (
                <EvidenceRow key={item.id} item={item} onPreview={() => setPreview(item)} />
              ))}
            </div>
          </section>
          <CaseTimeline bundle={bundle} audit={audit} />
          {bundle.messages.length > 0 && (
            <section className="sheet flutter rounded-[6px] p-5">
              <h3 className="hand text-xl text-violet">the messy chat</h3>
              <div className="mt-3 space-y-2">
                {bundle.messages.map((message) => {
                  const highlight = /got the laptop|thanks|received|working/i.test(message.body);
                  return (
                    <div key={message.id} className={`ticket rounded-[4px] px-3 py-2 ${highlight ? "bg-emerald/8" : "bg-sunken"}`}>
                      <div className="text-[11px] uppercase text-muted">
                        {message.senderType} · {formatAbsolute(message.sentAt)}
                      </div>
                      <p className="mt-1 text-sm">{message.body}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
          <div className="space-y-5">
            <PaymentTruth bundle={bundle} />
            <PayloadPreview disputeId={bundle.dispute.id} />
            <InvestigationPanel bundle={bundle} score={score} />
          </div>
      </div>

      <HumanDecisionCard bundle={bundle} role={role as UserRole} />

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

function EvidenceRow({ item, onPreview }: { item: EvidenceItem; onPreview: () => void }) {
  const router = useRouter();
  async function toggle(included: boolean) {
    await fetch(`/api/evidence/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includedInContest: included }),
    });
    router.refresh();
  }
  return (
    <div className="sheet flutter rounded-[6px] p-4 text-left">
      <button type="button" className="w-full text-left" onClick={onPreview}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="mt-1 text-xs text-muted">
              {item.type.replaceAll("_", " ")} · {item.source} · {formatAbsolute(item.createdAt)}
            </div>
          </div>
          <Badge tone={item.verified ? "emerald" : "amber"}>{item.verified ? "Verified" : "Unverified"}</Badge>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{item.contentText}</p>
      </button>
      <label className="mt-3 flex items-center justify-between text-xs text-muted">
        Included in contest
        <input type="checkbox" checked={item.includedInContest} onChange={(event) => toggle(event.target.checked)} />
      </label>
    </div>
  );
}
