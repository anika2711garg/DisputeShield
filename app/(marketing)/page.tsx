import type { ReactNode } from "react";
import Link from "next/link";
import { Check, Lock, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { ThemeSwitch } from "@/components/layout/theme-switch";
import { LandingFlow } from "@/components/marketing/landing-flow";
import { LandingHero } from "@/components/marketing/landing-hero";
import { HandNote, Reveal, Stagger, StaggerItem, TiltCard } from "@/components/motion/primitives";

export default function LandingPage() {
  return (
    <div className="app-grid relative min-h-screen overflow-hidden text-foreground">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandLogo size={34} />
        <div className="flex items-center gap-3">
          <ThemeSwitch />
          <Link href="/login" className="ink-underline px-3 py-2 text-sm text-muted">
            Sign in
          </Link>
          <Link href="/dashboard" className="press rounded-[4px] bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(12,79,71,0.25)]">
            Explore live demo
          </Link>
        </div>
      </header>

      <LandingHero />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-14">
        <LandingFlow />
      </section>

      <Stagger className="relative z-10 mx-auto grid max-w-6xl gap-5 px-6 pb-14 md:grid-cols-2">
        <StaggerItem>
          <TiltCard>
            <Shot title="Investigation workspace" caption="Rahul Sharma · MacBook Air · score 92" accent="from-violet/10">
              <div className="flex items-center gap-4">
                <div className="glow-ring grid size-16 place-items-center rounded-full border-[3px] border-emerald text-sm font-semibold text-emerald">92</div>
                <div className="text-sm">
                  Strong merchant package
                  <div className="mt-1 font-medium">Contest is only a recommendation</div>
                </div>
              </div>
            </Shot>
          </TiltCard>
        </StaggerItem>
        <StaggerItem>
          <TiltCard>
            <Shot title="Evidence graph" caption="Payment → invoice → BlueDart → chat" accent="from-cyan/10">
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                {[
                  ["Payment", "bg-primary/10 text-primary"],
                  ["Order", "bg-electric/10 text-electric"],
                  ["Invoice", "bg-cyan/10 text-cyan"],
                  ["Shipment", "bg-teal/10 text-teal"],
                  ["Delivery", "bg-emerald/10 text-emerald"],
                  ["Chat", "bg-violet/10 text-violet"],
                ].map(([item, cls]) => (
                  <div key={item} className={`ticket rounded-[3px] px-2 py-2 ${cls}`}>
                    {item}
                  </div>
                ))}
              </div>
            </Shot>
          </TiltCard>
        </StaggerItem>
      </Stagger>

      <Stagger className="relative z-10 mx-auto grid max-w-6xl gap-4 px-6 pb-14 md:grid-cols-3" delay={0.08}>
        {[
          ["01 Collect", "Payment, invoice, tracking, delivery, and the messy chat thread."],
          ["02 Investigate", "Rules score the file. AI only reads the conversation."],
          ["03 Decide", "A reviewer contests or accepts. The model never submits."],
        ].map(([title, copy]) => (
          <StaggerItem key={title}>
            <TiltCard>
              <div className="sheet flutter rounded-[6px] p-5">
                <div className="display text-xl italic text-primary">{title}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
              </div>
            </TiltCard>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <Reveal>
          <div className="decision-glow relative rounded-[8px] bg-[#241c14] p-8 text-[#f4ead8] md:p-10">
            <span className="stamp absolute -right-1 top-8 hidden sm:inline-flex">Signed</span>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-white/8">
                <Lock className="size-5 text-amber-200" />
              </span>
              <div>
                <h2 className="display text-3xl italic">The human still signs</h2>
                <HandNote className="hand mt-1 text-xl text-amber-200/80" rotate={-4} delay={0.2}>
                  leave a coffee ring if you must — not a machine
                </HandNote>
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Trust title="AI can" good items={["summarize chats", "spot contradictions", "explain evidence"]} />
              <Trust title="AI cannot" good={false} items={["score the file", "verify webhooks", "query SQL", "submit contests", "move money"]} />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Shot({ title, caption, children, accent }: { title: string; caption: string; children: ReactNode; accent: string }) {
  return (
    <div className={`sheet flutter rounded-[6px] bg-gradient-to-br ${accent} to-surface p-5`}>
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{title}</div>
      {children}
      <p className="mt-3 text-xs text-muted">{caption}</p>
    </div>
  );
}

function Trust({ title, items, good }: { title: string; items: string[]; good: boolean }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-white/70">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            {good ? <Check className="size-4 text-emerald-300" /> : <X className="size-4 text-red-300" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
