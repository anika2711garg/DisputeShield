"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const STEPS = [
  "₹60,000 dispute arrives",
  "AI scanning payment",
  "Invoice found ✓",
  "Delivery found ✓",
  "Customer acknowledgement found ✓",
  "Evidence score 92",
  "CONTEST RECOMMENDED",
];

export function HeroInvestigation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((value) => (value + 1) % STEPS.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface p-6 hairline">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
      <div className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">Live investigation</div>
      <div className="text-2xl font-semibold">disp_hero_macbook</div>
      <div className="mt-1 text-muted">Rahul Sharma · Product not received</div>
      <div className="relative mt-6 h-40 overflow-hidden rounded-2xl bg-sunken">
        <div className="scanline absolute inset-x-0 h-10 bg-gradient-to-b from-cyan/0 via-cyan/20 to-cyan/0" />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex h-full items-center justify-center px-6 text-center text-lg"
          >
            {STEPS[step]}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted">Case readiness</span>
        <span className="font-mono text-cyan">{step >= 5 ? "92 / 100" : "—"}</span>
      </div>
    </div>
  );
}
