"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { HandNote, InkHeadline, Reveal, Stamp } from "@/components/motion/primitives";

export function LandingHero() {
  return (
    <section className="aurora relative mx-auto max-w-6xl px-6 pb-12 pt-10">
      <span className="clip" aria-hidden />
      <Reveal>
        <p className="relative z-10 text-[11px] font-bold uppercase tracking-[0.28em] text-violet">Desk file · Northstar</p>
      </Reveal>
      <InkHeadline
        className="relative z-10 mt-4 max-w-4xl text-5xl leading-[0.95] md:text-7xl"
        lines={[
          <span key="a" className="display italic">
            AI <span className="gradient-text not-italic scribble">investigates.</span>
          </span>,
          <span key="b" className="display">
            Humans still decide.
          </span>,
        ]}
      />
      <HandNote className="hand relative z-10 mt-3 ml-1 text-2xl text-violet md:ml-8" rotate={-7} delay={0.55}>
        (the model never clicks Contest)
      </HandNote>
      <Reveal delay={0.28} className="relative z-10">
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          A chargeback desk that feels like a paper file on a lamp-lit table — payment, courier, and the messy chat in one place. You still sign the last line.
        </p>
      </Reveal>
      <motion.div
        className="relative z-10 mt-8 flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.45 }}
      >
        <Link
          href="/dashboard"
          className="press group inline-flex items-center gap-2 rounded-[4px] bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(12,79,71,0.28)]"
        >
          Open the live desk
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </Link>
        <Link href="/disputes/disp_hero_macbook" className="ticket ink-underline rounded-[4px] px-5 py-3 text-sm">
          ₹60,000 MacBook file
        </Link>
        <Stamp delay={0.7} className="stamp ml-2 hidden sm:inline-flex">
          Human gate
        </Stamp>
      </motion.div>
    </section>
  );
}
