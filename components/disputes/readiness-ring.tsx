"use client";

import { useState } from "react";
import { motion } from "motion/react";

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
  const [open, setOpen] = useState(false);
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const strength = score >= 80 ? "Strong" : score >= 50 ? "Moderate" : "Weak";

  return (
    <button type="button" onClick={() => setOpen((v) => !v)} className="text-left">
      <span className="sr-only">Case readiness {score} out of 100</span>
      <div className="flex items-center gap-6">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
          <motion.circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transform="rotate(-90 70 70)"
          />
          <text x="70" y="66" textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="600">
            {score}
          </text>
          <text x="70" y="86" textAnchor="middle" fill="var(--text-muted)" fontSize="10">
            / 100
          </text>
        </svg>
        <div>
          <div className="text-sm text-muted">Case readiness</div>
          <div className="mt-2 text-sm">Evidence: {strength}</div>
          <div className="text-sm">AI confidence: {Math.round(confidence * 100)}%</div>
          <div className="text-sm">Missing critical documents: {missing}</div>
        </div>
      </div>
      {open && breakdown && (
        <div className="mt-4 space-y-2">
          {breakdown.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-muted">
                <span>{item.label}</span>
                <span>
                  {item.awarded}/{item.max}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-sunken">
                <div className="h-1.5 rounded-full bg-cyan" style={{ width: `${(item.awarded / item.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
