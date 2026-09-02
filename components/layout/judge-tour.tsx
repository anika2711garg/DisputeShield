"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { AnimatePresence, motion } from "motion/react";
import { Play, X } from "lucide-react";

const STEPS = [
  { title: "Thesis", body: "AI investigates. Humans decide. Razorpay never receives a contest unless a reviewer clicks.", href: "/dashboard" },
  { title: "Amount at risk", body: "Prioritize rupees that can still be contested before the processor deadline.", href: "/dashboard" },
  { title: "Hero case", body: "Rahul Sharma · MacBook Air ₹60,000 · BlueDart + chat acknowledgement.", href: "/disputes/disp_hero_macbook" },
  { title: "Rules vs AI", body: "The ring is scored in TypeScript. The violet card is interpretation only.", href: "/disputes/disp_hero_macbook" },
  { title: "What-if", body: "Turn off delivery or chat and watch the rules score drop — no extra AI call.", href: "/disputes/disp_hero_macbook" },
  { title: "Human gate", body: "Contest stays disabled until acknowledgement. Analysts cannot submit.", href: "/disputes/disp_hero_macbook" },
  { title: "Razorpay payload", body: "Preview the exact POST /v1/disputes/{id}/contest body before anything is armed.", href: "/disputes/disp_hero_macbook" },
  { title: "Webhook inbox", body: "Ingest payment.dispute.* events with HMAC verification — the Razorpay-shaped entry point.", href: "/webhooks" },
  { title: "Threshold lab", body: "Move the contest cutoff and see which files flip. No writes.", href: "/lab" },
];

export function JudgeTour() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const current = STEPS[step] ?? STEPS[0];

  function go(index: number) {
    const next = STEPS[index];
    if (!next) return;
    setStep(index);
    router.push(next.href as Route);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStep(0);
          const first = STEPS[0];
          if (first) router.push(first.href as Route);
        }}
        className="hidden items-center gap-1.5 rounded-full bg-violet/10 px-2.5 py-1 text-[11px] font-medium text-violet lg:inline-flex"
      >
        <Play className="size-3" /> Judge tour
      </button>
      <AnimatePresence>
        {open && current && (
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-4 right-4 z-40 w-[320px] rounded-[16px] bg-[#101828] p-4 text-white shadow-[0_18px_40px_rgba(16,24,40,0.28)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Step {step + 1} / {STEPS.length}
                </div>
                <h3 className="mt-1 text-sm font-semibold">{current.title}</h3>
              </div>
              <button type="button" aria-label="Close tour" onClick={() => setOpen(false)} className="grid size-7 place-items-center rounded-md bg-white/8">
                <X className="size-3.5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-300">{current.body}</p>
            <div className="mt-4 flex justify-between">
              <button type="button" className="text-xs text-slate-400" disabled={step === 0} onClick={() => go(step - 1)}>
                Back
              </button>
              <button
                type="button"
                className="rounded-full bg-primary px-3 py-1 text-xs font-medium"
                onClick={() => {
                  if (step >= STEPS.length - 1) setOpen(false);
                  else go(step + 1);
                }}
              >
                {step >= STEPS.length - 1 ? "Done" : "Next"}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
