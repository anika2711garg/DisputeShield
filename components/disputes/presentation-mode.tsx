"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CaseBundle } from "@/types/case";
import type { ScoreBreakdown } from "@/lib/rules/evidence-score";
import { formatInr } from "@/lib/utils";
import { recommendationLabel } from "@/lib/ui/labels";
import { Button } from "@/components/ui/button";

export function PresentationMode({ bundle, score }: { bundle: CaseBundle; score: ScoreBreakdown }) {
  const [open, setOpen] = useState(false);
  const rec = bundle.recommendation;

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Presentation Mode
      </Button>
      <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0B1020] p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl rounded-[20px] bg-white p-10 text-slate-900"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-600">Hero case</div>
            <p className="mt-3 text-5xl font-semibold tracking-tight">{formatInr(bundle.dispute.amount)} at risk</p>
            <p className="mt-3 capitalize text-slate-500">Claim: {bundle.dispute.reasonDescription}</p>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {["Delivered ✓", "Customer acknowledged ✓", "Addresses match ✓"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                  className="rounded-[12px] bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700"
                >
                  {item}
                </motion.div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <Stat label="Evidence score" value={`${score.total} / 100`} />
              <Stat label="AI" value={recommendationLabel(rec?.modelRecommendation)} />
              <Stat label="Rules" value={recommendationLabel(rec?.rulesRecommendation)} />
              <Stat label="Final" value="Human decides" />
            </div>
            <p className="mt-10 text-center text-2xl font-semibold tracking-tight">AI investigates. Humans decide.</p>
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-slate-50 p-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
