"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { recommendationLabel, recommendationTone } from "@/lib/ui/labels";
import { cn } from "@/lib/utils";

export function RecommendationCard({
  title,
  value,
  detail,
  kind,
}: {
  title: string;
  value?: string | null;
  detail?: string;
  kind: "ai" | "rules" | "human";
}) {
  return (
    <motion.div
      whileHover={{ y: -5, rotate: -0.8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className={cn(
        "sheet flutter rounded-[6px] p-4",
        kind === "ai" && "bg-gradient-to-br from-violet/10 to-surface",
        kind === "rules" && "bg-gradient-to-br from-cyan/10 to-surface",
        kind === "human" && "bg-[#1c2421] text-[#fff8ee]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", kind === "human" ? "text-slate-400" : "text-muted")}>
          {title}
        </div>
        <Badge tone={kind === "ai" ? "ai" : kind === "rules" ? "cyan" : "electric"}>
          {kind === "human" ? "Authority" : kind === "ai" ? "Interpretation" : "Evidence"}
        </Badge>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xl font-semibold tracking-tight">{recommendationLabel(value)}</span>
        {kind !== "human" && <Badge tone={recommendationTone(value ?? undefined)}>{value ?? "pending"}</Badge>}
      </div>
      {detail && <p className={cn("mt-2 text-sm", kind === "human" ? "text-slate-400" : "text-muted")}>{detail}</p>}
    </motion.div>
  );
}
