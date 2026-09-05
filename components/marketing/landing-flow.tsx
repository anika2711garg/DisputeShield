"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const STEPS = [
  ["Payment", "bg-primary"],
  ["Invoice", "bg-electric"],
  ["Delivery", "bg-teal"],
  ["Chat", "bg-violet"],
  ["Score 92", "bg-emerald"],
  ["Human", "bg-[#241c14]"],
];

export function LandingFlow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setActive((value) => (value + 1) % STEPS.length), 1100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="sheet flutter relative overflow-hidden rounded-[6px] p-6">
      <span className="clip" aria-hidden />
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">How a file moves</div>
        <span className="hand text-lg text-violet">ORD-8291 · live path</span>
      </div>
      <div className="connector flex flex-wrap items-center gap-2 pb-3">
        {STEPS.map(([label, color], index) => (
          <motion.div
            key={label}
            animate={{
              y: active === index ? -6 : 0,
              rotate: active === index ? -2 : index % 2 ? 1 : -0.6,
              scale: active === index ? 1.08 : 1,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 16 }}
            className="relative z-10 flex items-center gap-2"
          >
            <span className={`rounded-[3px] px-3 py-1.5 text-xs font-semibold text-white ${color}`}>{label}</span>
            {index < STEPS.length - 1 && <span className="text-muted/50">→</span>}
          </motion.div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">Collect on paper. Score in TypeScript. A person still has to sign the contest.</p>
    </div>
  );
}
