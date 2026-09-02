"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export const INVESTIGATION_STAGES = [
  "Collecting merchant evidence",
  "Reading customer communication",
  "Matching evidence to dispute",
  "Checking contradictions",
  "Preparing recommendation",
] as const;

export function InvestigationOverlay({
  active,
  done,
}: {
  active: boolean;
  done: boolean;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      const reset = window.setTimeout(() => setStage(0), 0);
      return () => window.clearTimeout(reset);
    }
    const id = window.setInterval(() => {
      setStage((current) => Math.min(INVESTIGATION_STAGES.length - 1, current + 1));
    }, 700);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active && !done) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4" role="status" aria-live="polite">
      <div className="w-full max-w-md rounded-3xl bg-surface p-6 hairline">
        <div className="text-xs uppercase tracking-[0.2em] text-ai">AI investigation</div>
        <div className="relative mt-4 h-10 overflow-hidden rounded-xl bg-sunken">
          <div className="scanline absolute inset-x-0 h-8 bg-gradient-to-b from-cyan/0 via-cyan/25 to-cyan/0" />
        </div>
        <ol className="mt-5 space-y-2">
          {INVESTIGATION_STAGES.map((label, index) => {
            const current = done ? index === INVESTIGATION_STAGES.length - 1 : index === stage;
            const complete = done || index < stage;
            return (
              <motion.li
                key={label}
                animate={{ opacity: current || complete ? 1 : 0.4 }}
                className="flex items-center gap-3 text-sm"
              >
                <span className={`grid size-5 place-items-center rounded-full text-[10px] ${complete ? "bg-cyan text-black" : current ? "bg-ai text-white" : "hairline"}`}>
                  {complete ? "✓" : index + 1}
                </span>
                {label}
              </motion.li>
            );
          })}
        </ol>
        <p className="mt-4 text-xs text-muted">Deterministic scoring runs in code. The model only interprets this case.</p>
      </div>
    </div>
  );
}
