"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const STEPS = [
  ["Payment", "bg-blue-500"],
  ["Invoice", "bg-cyan-500"],
  ["Delivery", "bg-teal-500"],
  ["Chat", "bg-violet-500"],
  ["Score 92", "bg-emerald-500"],
  ["Human", "bg-[#101828]"],
];

export function LandingFlow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setActive((value) => (value + 1) % STEPS.length), 900);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="overflow-hidden rounded-[16px] bg-surface p-5 hairline">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Live product path</div>
      <div className="connector flex flex-wrap items-center gap-2 pb-2">
        {STEPS.map(([label, color], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: active === index ? 1.08 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.05 }}
            className="relative z-10 flex items-center gap-2"
          >
            <span className={`rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-sm ${color}`}>
              {label}
            </span>
            {index < STEPS.length - 1 && <span className="text-slate-300">→</span>}
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">Collect → investigate → score in code → a human still has to click Contest.</p>
    </div>
  );
}
