"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/primitives";

export function MetricCard({
  label,
  value,
  hint,
  delta,
  tone,
  size = "md",
  spark,
  delay = 0,
  peek,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  tone?: "default" | "danger" | "amber" | "ai" | "cyan" | "emerald";
  size?: "sm" | "md" | "lg";
  spark?: number[];
  delay?: number;
  peek?: string;
}) {
  const tints = {
    default: "bg-surface",
    danger: "bg-gradient-to-br from-surface to-danger/10",
    amber: "bg-gradient-to-br from-surface to-amber/10",
    ai: "bg-gradient-to-br from-surface to-violet/10",
    cyan: "bg-gradient-to-br from-surface to-cyan/10",
    emerald: "bg-gradient-to-br from-surface to-emerald/10",
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, rotate: -0.8, transition: { duration: 0.22 } }}
      className={cn("sheet flutter group relative rounded-[6px] p-4", tints[tone ?? "default"], size === "lg" && "p-5 md:col-span-2")}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</div>
      <div
        className={cn(
          "display mt-2 tracking-tight tabular",
          size === "lg" ? "text-4xl" : "text-[28px]",
          tone === "danger" && "text-danger",
          tone === "amber" && "text-amber",
          tone === "ai" && "text-violet",
          tone === "cyan" && "text-cyan",
          tone === "emerald" && "text-emerald",
        )}
      >
        <CountUp value={value} />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
        <span>
          {typeof delta === "number" && (
            <span className={delta >= 0 ? "mr-1 text-emerald" : "mr-1 text-danger"}>
              {delta >= 0 ? "+" : ""}
              {delta}%
            </span>
          )}
          {hint}
        </span>
        {spark && <Spark values={spark} tone={tone} />}
      </div>
      {peek && (
        <p className="mt-2 max-h-0 overflow-hidden text-[11px] leading-4 text-muted transition-all duration-300 group-hover:max-h-12">
          {peek}
        </p>
      )}
    </motion.section>
  );
}

function Spark({ values, tone }: { values: number[]; tone?: string }) {
  const max = Math.max(...values, 1);
  const color = tone === "danger" ? "#C45C4A" : tone === "amber" ? "#C4843A" : tone === "emerald" ? "#2D6A4F" : "#0F5C54";
  return (
    <svg width="56" height="20" viewBox="0 0 56 20" aria-hidden>
      {values.map((value, index) => (
        <motion.rect
          key={index}
          x={index * 8}
          width="5"
          rx="1"
          fill={color}
          opacity={0.35 + (index / values.length) * 0.65}
          initial={{ height: 0, y: 20 }}
          animate={{ height: (value / max) * 18, y: 20 - (value / max) * 18 }}
          transition={{ delay: index * 0.04, duration: 0.35 }}
        />
      ))}
    </svg>
  );
}
