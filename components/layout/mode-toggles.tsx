"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ThemeSwitch } from "./theme-switch";

type Snapshot = {
  writeArmed: boolean;
  writesEnvEnabled: boolean;
  liveWrites: boolean;
};

export function ModeToggles({
  writeArmed,
  writesEnvEnabled,
  compact = false,
}: {
  writeArmed: boolean;
  writesEnvEnabled: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(writeArmed);

  useEffect(() => setArmed(writeArmed), [writeArmed]);

  async function toggleArmed(next: boolean) {
    if (next === armed) return;
    setArmed(next);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ writeArmed: next }),
    });
    const data = (await response.json()) as { razorpay?: Snapshot };
    if (!response.ok) {
      setArmed(!next);
      toast.error("Could not update Razorpay mode");
      return;
    }
    toast.success(next ? "Razorpay writes armed — still blocked unless ENABLE_RAZORPAY_WRITES=true." : "Simulation mode — Razorpay will not be mutated.");
    if (data.razorpay?.liveWrites) toast.message("Live writes enabled");
    router.refresh();
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "gap-1.5")}>
      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] font-medium text-muted sm:inline">Theme</span>
        <ThemeSwitch />
      </div>
      <Segmented
        label="Razorpay write mode"
        value={armed ? "armed" : "sim"}
        onChange={(value) => toggleArmed(value === "armed")}
        options={[
          { id: "sim", label: compact ? "" : "Simulation", icon: Shield, active: "bg-amber" },
          { id: "armed", label: compact ? "" : "Armed", icon: Zap, active: "bg-danger" },
        ]}
      />
      {armed && !writesEnvEnabled && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden rounded-full bg-amber/10 px-2 py-1 text-[10px] font-medium text-amber lg:inline"
        >
          Writes still blocked by env
        </motion.span>
      )}
    </div>
  );
}

function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string; icon: LucideIcon; active: string }[];
  onChange: (id: string) => void;
}) {
  const layoutId = useId();
  return (
    <div className="relative flex rounded-full bg-sunken p-1 hairline" role="group" aria-label={label}>
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "relative inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              active ? "text-white" : "text-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className={cn("absolute inset-0 rounded-full shadow-sm", option.active)}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <option.icon className="relative z-10 size-3" />
            {option.label ? <span className="relative z-10">{option.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
