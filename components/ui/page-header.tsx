"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <motion.div
        className="max-w-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {eyebrow && <p className="hand text-lg text-violet">{eyebrow}</p>}
        <h1 className="display ink-title mt-1 text-[32px] italic leading-none">{title}</h1>
        {description && <p className="mt-2.5 text-[13.5px] leading-6 text-muted">{description}</p>}
      </motion.div>
      {actions && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.35 }}>
          {actions}
        </motion.div>
      )}
    </div>
  );
}
