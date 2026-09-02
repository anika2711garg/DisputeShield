"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Reveal } from "@/components/motion/primitives";

export function LandingHero() {
  return (
    <section className="aurora mx-auto max-w-6xl px-6 pb-12 pt-8">
      <Reveal>
        <p className="relative z-10 text-[12px] font-semibold uppercase tracking-[0.22em] text-violet">DisputeShield</p>
      </Reveal>
      <motion.h1
        className="relative z-10 mt-4 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        AI <span className="gradient-text">investigates.</span>
        <br />
        <span className="text-foreground">Humans decide.</span>
      </motion.h1>
      <Reveal delay={0.16} className="relative z-10">
        <p className="mt-5 max-w-2xl text-lg leading-7 text-muted">
          Turn scattered payment, delivery, and customer evidence into a review-ready dispute case — without giving AI control of the final decision.
        </p>
      </Reveal>
      <motion.div
        className="relative z-10 mt-8 flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.4 }}
      >
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-[9px] bg-primary px-5 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition hover:translate-y-[-1px]">
          Explore live demo <ArrowRight className="size-4" />
        </Link>
        <Link href="/disputes/disp_hero_macbook" className="rounded-[9px] bg-surface px-5 py-3 text-sm hairline transition hover:-translate-y-0.5">
          View ₹60K hero case
        </Link>
      </motion.div>
    </section>
  );
}
