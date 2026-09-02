"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils";

export function ConfirmDecisionDialog({
  action,
  amount,
  caseId,
  onCancel,
  onConfirm,
  busy,
}: {
  action: "contest" | "accept";
  amount: number;
  caseId: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  const destructive = action === "accept";
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[16px] bg-surface p-6 shadow-[var(--shadow)]"
      >
        <h3 id="decision-title" className={`text-lg font-semibold ${destructive ? "text-danger" : ""}`}>
          {destructive ? "Accept this dispute?" : "Contest this chargeback?"}
        </h3>
        <p className="mt-3 text-sm text-muted">
          DisputeShield will not take this action automatically. You are making the final decision.
        </p>
        <p className="mt-2 text-sm">
          {caseId} · {formatInr(amount)}
        </p>
        <div className="mt-4 rounded-[10px] bg-amber/8 px-3 py-2 text-xs font-medium text-amber">
          Razorpay writes disabled — demo action only
        </div>
        <p className="mt-2 text-xs text-muted">Simulation mode. No financial mutation is sent to Razorpay.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={destructive ? "danger" : "default"} disabled={busy} onClick={onConfirm}>
            {busy ? "Submitting…" : destructive ? "Accept dispute" : "Contest chargeback"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
