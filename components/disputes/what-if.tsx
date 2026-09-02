"use client";

import { useState } from "react";
import type { EvidenceItem } from "@/types/domain";

export function WhatIfPanel({
  disputeId,
  evidence,
  baseline,
  baselineRec,
}: {
  disputeId: string;
  evidence: EvidenceItem[];
  baseline: number;
  baselineRec: string;
}) {
  const [disabled, setDisabled] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; rec: string } | null>(null);

  async function toggle(id: string) {
    const next = disabled.includes(id) ? disabled.filter((item) => item !== id) : [...disabled, id];
    setDisabled(next);
    const response = await fetch(`/api/disputes/${disputeId}/what-if`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabledEvidenceIds: next }),
    });
    const data = await response.json();
    setResult({ score: data.score.total, rec: data.recommendation.finalRecommendation });
  }

  return (
    <div className="rounded-xl bg-sunken p-4">
      <div className="text-sm font-medium">What if?</div>
      <p className="mt-1 text-xs text-muted">Temporarily disable evidence. Score is recalculated locally — no extra AI call.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {evidence.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            className={`rounded-full px-3 py-1 text-xs hairline ${disabled.includes(item.id) ? "bg-danger/20 text-danger" : ""}`}
          >
            {disabled.includes(item.id) ? "Off" : "On"} · {item.title}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm">
        Score: {baseline} → {result?.score ?? baseline}
        <span className="mx-2 text-muted">·</span>
        {baselineRec} → {result?.rec ?? baselineRec}
      </div>
    </div>
  );
}
