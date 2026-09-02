"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { EvidenceItem, EvidenceType } from "@/types/domain";
import { Button } from "@/components/ui/button";

const TOGGLES: { label: string; types: EvidenceType[] }[] = [
  { label: "Payment", types: ["payment"] },
  { label: "Invoice", types: ["billing_proof"] },
  { label: "Tracking", types: ["shipping_proof"] },
  { label: "Delivery confirmation", types: ["delivery_confirmation"] },
  { label: "Customer acknowledgement", types: ["customer_communication"] },
  { label: "Address consistency", types: ["other"] },
];

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
  const [open, setOpen] = useState(false);
  const [off, setOff] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; rec: string } | null>(null);

  async function toggle(label: string) {
    const next = off.includes(label) ? off.filter((item) => item !== label) : [...off, label];
    setOff(next);
    const disabledIds = evidence
      .filter((item) => next.some((name) => TOGGLES.find((toggle) => toggle.label === name)?.types.includes(item.type)))
      .map((item) => item.id);
    const response = await fetch(`/api/disputes/${disputeId}/what-if`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabledEvidenceIds: disabledIds }),
    });
    const data = await response.json();
    setResult({ score: data.score.total, rec: data.recommendation.finalRecommendation });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        What-if
      </Button>
      <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="flex-1" aria-label="Close what-if" onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full max-w-md bg-surface p-6 shadow-[var(--shadow)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">What-if</h2>
                <p className="mt-1 text-sm text-muted">No AI call required. Rules recalculated locally.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-[8px] hairline">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 space-y-2">
              {TOGGLES.map((item) => {
                const enabled = !off.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => toggle(item.label)}
                    className="flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-sm hairline"
                  >
                    <span>{item.label}</span>
                    <span className={enabled ? "text-emerald" : "text-danger"}>{enabled ? "On" : "Off"}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 rounded-[10px] bg-cyan-50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan">Rules recalculated</div>
              <motion.div key={result?.score ?? baseline} initial={{ scale: 0.92, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="mt-2 text-3xl font-semibold tabular">
                {baseline}
                <span className="mx-2 text-muted">↓</span>
                {result?.score ?? baseline}
              </motion.div>
              <div className="mt-1 text-sm capitalize text-muted">
                {baselineRec.replaceAll("_", " ")} → {(result?.rec ?? baselineRec).replaceAll("_", " ")}
              </div>
              <p className="mt-2 text-xs text-muted">No additional AI call.</p>
            </div>
          </motion.aside>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

export { WhatIfPanel as WhatIfDrawer };
