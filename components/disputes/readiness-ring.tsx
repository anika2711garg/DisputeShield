"use client";

import { motion } from "motion/react";

const LABEL_MAP: Record<string, string> = {
  "Payment validity": "Payment verified",
  "Billing / invoice": "Billing match",
  "Shipping / service proof": "Shipping match",
  "Delivery / completion proof": "Delivery proof",
  "Customer acknowledgement": "Customer acknowledgement",
  "Evidence consistency": "Evidence consistency",
};

export function ReadinessRing({
  score,
  confidence,
  missing,
  breakdown,
}: {
  score: number;
  confidence: number;
  missing: number;
  breakdown?: { label: string; awarded: number; max: number }[];
}) {
  const r = 62;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const strength = score >= 80 ? "Strong evidence" : score >= 50 ? "Moderate evidence" : "Weak evidence";
  const stroke = score >= 80 ? "var(--emerald)" : score >= 50 ? "var(--amber)" : "var(--danger)";

  return (
    <div>
      <div className="flex items-center gap-6">
        <svg width="156" height="156" viewBox="0 0 156 156" aria-label={`Evidence score ${score} of 100`}>
          <circle cx="78" cy="78" r={r} fill="none" stroke="var(--border)" strokeWidth="11" />
          <motion.circle
            cx="78"
            cy="78"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.7 }}
            transform="rotate(-90 78 78)"
          />
          <text x="78" y="74" textAnchor="middle" fill="var(--text)" fontSize="28" fontWeight="600">
            {score}
          </text>
          <text x="78" y="94" textAnchor="middle" fill="var(--text-muted)" fontSize="11">
            / 100
          </text>
        </svg>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Rules-calculated</div>
          <div className="mt-1 text-lg font-semibold">{strength}</div>
          <div className="mt-1 text-sm text-muted">AI confidence {Math.round(confidence * 100)}% · missing {missing}</div>
        </div>
      </div>
      {breakdown && (
        <div className="mt-5 space-y-2.5">
          {breakdown.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs">
                <span>{LABEL_MAP[item.label] ?? item.label}</span>
                <span className="font-mono text-muted">
                  {item.awarded}/{item.max}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunken">
                <motion.div
                  className="h-1.5 rounded-full bg-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.awarded / item.max) * 100}%` }}
                  transition={{ duration: 0.55, delay: 0.15 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
