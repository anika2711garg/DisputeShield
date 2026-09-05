"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CaseBundle } from "@/types/case";
import type { ScoreBreakdown } from "@/lib/rules/evidence-score";
import { CopilotPanel } from "./copilot";

export function InvestigationPanel({ bundle, score }: { bundle: CaseBundle; score: ScoreBreakdown }) {
  const summary =
    bundle.investigation?.summary ??
    "BlueDart confirms delivery in Bengaluru on 14 Aug. The customer subsequently acknowledged receiving the laptop in chat. Payment, shipping and customer evidence are consistent with successful fulfillment.";
  const strong = bundle.evidence.filter((item) => item.strengthScore >= 80).map((item) => item.title);
  const missing = score.missingCritical.length ? score.missingCritical.map((item) => item.replaceAll("_", " ")) : [];
  const contradictions =
    bundle.recommendation?.overrideReasons?.length
      ? bundle.recommendation.overrideReasons
      : ["Customer claims non-delivery; delivery confirmation and chat acknowledgement contradict that claim."];

  return (
    <aside className="space-y-4">
      <div className="sheet flutter overflow-hidden rounded-[6px] bg-gradient-to-br from-violet/10 to-surface">
        <div className="flex items-center justify-between bg-[#1c2421] px-5 py-3 text-[#fff8ee]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet" />
            <h2 className="text-sm font-semibold">AI Investigation</h2>
          </div>
          <Badge tone="ai">Interpretation only</Badge>
        </div>
        <div className="p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet">Key finding</div>
          <p className="mt-2 text-sm leading-6">{summary}</p>
          <Section title="Supporting evidence" items={strong.length ? strong : ["Payment captured", "Delivery confirmation", "Customer acknowledgement"]} />
          <Section title="Potential weakness" items={contradictions} />
          <Section title="Missing information" items={missing.length ? missing : ["None critical"]} />
          <p className="mt-4 text-[11px] text-muted">AI does not calculate the evidence score or submit decisions.</p>
        </div>
      </div>
      <CopilotPanel disputeId={bundle.dispute.id} />
    </aside>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{title}</div>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
