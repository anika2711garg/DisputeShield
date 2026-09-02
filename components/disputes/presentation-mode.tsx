"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CaseBundle } from "@/types/case";
import type { ScoreBreakdown } from "@/lib/rules/evidence-score";
import { Button } from "@/components/ui/button";

const STEPS = [
  "Dispute arrives",
  "Evidence discovered",
  "AI identifies reason",
  "Evidence score",
  "Recommendation",
  "Human review",
  "Razorpay submission",
  "Audit trail",
];

export function PresentationMode({ bundle, score }: { bundle: CaseBundle; score: ScoreBreakdown }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const details = [
    `${bundle.dispute.reasonDescription} · ₹${bundle.dispute.amount.toLocaleString("en-IN")}`,
    `${bundle.evidence.length} evidence items collected from payment, shipping and chat.`,
    `Classified as ${bundle.dispute.reasonDescription}.`,
    `${score.total} / 100 readiness.`,
    `${bundle.recommendation?.finalRecommendation ?? "human_review"} — AI investigates. Humans decide.`,
    "Reviewer inspects the contest package.",
    "ENABLE_RAZORPAY_WRITES defaults to simulation.",
    "Every action is append-only in the audit log.",
  ];

  useEffect(() => {
    if (!open || !playing) return;
    const id = window.setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [open, playing]);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          setOpen(true);
          setStep(0);
          setPlaying(true);
        }}
      >
        Presentation Mode
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6">
          <div className="w-full max-w-2xl rounded-3xl bg-surface p-10 text-center hairline">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan">
              Step {step + 1} / 8 · {playing ? "Auto-play" : "Paused"}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="mt-4 text-4xl font-semibold">{STEPS[step]}</h2>
                <p className="mt-4 text-lg text-muted">{details[step]}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={() => setPlaying((value) => !value)}>
                {playing ? "Pause" : "Play"}
              </Button>
              <Button
                onClick={() => {
                  setPlaying(false);
                  setStep((value) => (value + 1) % STEPS.length);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
