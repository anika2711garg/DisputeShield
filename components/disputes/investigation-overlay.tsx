"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export const INVESTIGATION_STAGES = [
  "Collecting payment…",
  "Loading invoice…",
  "Checking shipment…",
  "Verifying delivery…",
  "Reading customer communication…",
  "Building evidence graph…",
  "Writing AI summary…",
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
    }, 450);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <AnimatePresence>
      {(active || done) && (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center bg-[#241c14]/40 p-4"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28 }}
            className="sheet w-full max-w-md overflow-hidden rounded-[6px] p-6"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-cyan">Investigation</div>
            <p className="mt-1 text-sm text-muted">Rules will score the file in code. AI only interprets conversation.</p>
            <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-sunken">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-violet"
                animate={{ width: done ? "100%" : `${((stage + 1) / INVESTIGATION_STAGES.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <ol className="mt-5 space-y-2">
              {INVESTIGATION_STAGES.map((label, index) => {
                const current = done ? index === INVESTIGATION_STAGES.length - 1 : index === stage;
                const complete = done || index < stage;
                return (
                  <motion.li
                    key={label}
                    animate={{ opacity: current || complete ? 1 : 0.35, x: current ? 4 : 0 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <motion.span
                      animate={current && !complete ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ repeat: current && !complete ? Infinity : 0, duration: 0.9 }}
                      className={`grid size-5 place-items-center rounded-full text-[10px] ${complete ? "bg-cyan text-white" : current ? "bg-violet/15 text-violet" : "hairline"}`}
                    >
                      {complete ? "✓" : index + 1}
                    </motion.span>
                    {label}
                  </motion.li>
                );
              })}
            </ol>
            {done && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm font-medium text-emerald">
                Investigation complete
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
