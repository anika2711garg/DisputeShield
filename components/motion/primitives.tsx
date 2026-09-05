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
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 16, rotate: 1.4 },
        show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
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

export function InkHeadline({
  lines,
  className,
}: {
  lines: ReactNode[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <h1 className={className}>
      {lines.map((line, index) => (
        <motion.span
          key={index}
          className="block overflow-hidden"
          initial={reduce ? false : { y: "110%", rotate: 4 }}
          animate={{ y: "0%", rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.08 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {line}
        </motion.span>
      ))}
    </h1>
  );
}

export function Stamp({
  children,
  className,
  delay = 0.4,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial={reduce ? false : { scale: 1.6, opacity: 0, rotate: -18 }}
      animate={{ scale: 1, opacity: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 14, delay }}
    >
      {children}
    </motion.span>
  );
}

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -7, rotate: -1.1, transition: { type: "spring", stiffness: 320, damping: 16 } }}
      whileTap={{ scale: 0.985, rotate: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

export function HandNote({
  children,
  className,
  rotate = -8,
  delay = 0.35,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.p
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10, rotate: rotate - 8 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.p>
  );
}

export function Flutter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, rotate: -1.2, transition: { type: "spring", stiffness: 360, damping: 14 } }}
    >
      {children}
    </motion.div>
  );
}
