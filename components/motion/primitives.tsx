"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className, delay = 0.04 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  const parsed = value.match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/);
  const simple = Boolean(parsed);
  const numeric = parsed?.[2] ? Number(parsed[2].replace(/,/g, "")) : NaN;
  const prefix = parsed?.[1] ?? "";
  const suffix = parsed?.[3] ?? "";
  const fallback = Boolean(reduce) || !simple || !Number.isFinite(numeric);
  const [shown, setShown] = useState(fallback ? value : `${prefix}0${suffix}`);
  const [source, setSource] = useState(value);
  if (value !== source) {
    setSource(value);
    setShown(fallback ? value : `${prefix}0${suffix}`);
  }

  useEffect(() => {
    if (fallback) return;
    const start = performance.now();
    const duration = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const current = numeric * eased;
      const formatted = numeric >= 100 ? Math.round(current).toString() : current.toFixed(numeric % 1 ? 1 : 0);
      setShown(`${prefix}${formatted}${suffix}`);
      if (t < 1) requestAnimationFrame(tick);
      else setShown(value);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, numeric, prefix, suffix, fallback]);

  return <span className={className}>{shown}</span>;
}
