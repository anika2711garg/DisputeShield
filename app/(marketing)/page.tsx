import type { ReactNode } from "react";
import Link from "next/link";
import { Check, Lock, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { ThemeSwitch } from "@/components/layout/theme-switch";
import { LandingFlow } from "@/components/marketing/landing-flow";
import { LandingHero } from "@/components/marketing/landing-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";

export default function LandingPage() {
  return (
    <div className="app-grid min-h-screen text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandLogo size={32} />
        <div className="flex items-center gap-3">
          <ThemeSwitch />
          <Link href="/login" className="rounded-[9px] px-4 py-2 text-sm text-muted transition hover:-translate-y-0.5 hover:text-foreground">
            Sign in
          </Link>
          <Link href="/dashboard" className="rounded-[9px] bg-primary px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(15,92,84,0.25)] transition hover:-translate-y-0.5">
            Explore live demo
          </Link>
        </div>
      </header>

      <LandingHero />

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <LandingFlow />
      </section>

      <Stagger className="mx-auto grid max-w-6xl gap-4 px-6 pb-14 md:grid-cols-2">
        <StaggerItem>
        <Shot title="Investigation workspace" caption="₹60,000 MacBook · score 92 · contest recommended" accent="from-violet/10">
          <div className="flex items-center gap-4">
            <div className="glow-ring grid size-16 place-items-center rounded-full border-4 border-emerald text-sm font-semibold text-emerald">92</div>
            <div className="text-sm">
              Strong evidence
              <div className="mt-1 font-medium">Contest · pending human review</div>
            </div>
          </div>
        </Shot>
        </StaggerItem>
        <StaggerItem>
        <Shot title="Evidence graph" caption="Payment → Invoice → Delivery → Chat" accent="from-cyan/10">
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {[
              ["Payment", "bg-primary/10 text-primary"],
              ["Order", "bg-electric/10 text-electric"],
              ["Invoice", "bg-cyan/10 text-cyan"],
              ["Shipment", "bg-teal/10 text-teal"],
              ["Delivery", "bg-emerald/10 text-emerald"],
              ["Chat", "bg-violet/10 text-violet"],
            ].map(([item, cls]) => (
              <div key={item} className={`rounded-lg px-2 py-2 ${cls}`}>{item}</div>
            ))}
          </div>
        </Shot>
        </StaggerItem>
      </Stagger>

      <Stagger className="mx-auto grid max-w-6xl gap-4 px-6 pb-14 md:grid-cols-3" delay={0.08}>
        {[
          ["01 Collect", "Payment, order, invoice, tracking, delivery and customer communication.", "bg-cyan/10"],
          ["02 Investigate", "Rules score structured evidence. AI interprets messy conversations.", "bg-violet/10"],
          ["03 Decide", "A human reviewer must Contest or Accept. The model never submits.", "bg-primary/10"],
        ].map(([title, copy, bg]) => (
          <StaggerItem key={title}>
          <div className={`rounded-[14px] ${bg} p-5 hairline lift`}>
            <div className="text-sm font-semibold text-primary">{title}</div>
            <p className="mt-2 text-sm text-muted">{copy}</p>
          </div>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Reveal>
        <div className="decision-glow rounded-[20px] bg-[#101828] p-8 text-white md:p-10">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-white/8">
              <Lock className="size-5 text-cyan-300" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold">Human decision principle</h2>
              <p className="mt-1 text-sm text-slate-400">AI and rules recommend. Only a reviewer can move money.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Trust title="AI can" good items={["summarize chats", "identify contradictions", "explain evidence"]} />
            <Trust title="AI cannot" good={false} items={["calculate evidence scores", "verify Razorpay webhooks", "query SQL", "submit contests", "move money"]} />
          </div>
        </div>
        </Reveal>
      </section>
    </div>
  );
}

function Shot({ title, caption, children, accent }: { title: string; caption: string; children: ReactNode; accent: string }) {
  return (
    <div className={`rounded-[14px] bg-gradient-to-br ${accent} to-surface p-5 hairline lift`}>
      <div className="mb-3 text-xs text-muted">{title}</div>
      {children}
      <p className="mt-3 text-xs text-muted">{caption}</p>
    </div>
  );
}

function Trust({ title, items, good }: { title: string; items: string[]; good: boolean }) {
  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            {good ? <Check className="size-4 text-emerald-400" /> : <X className="size-4 text-red-400" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
