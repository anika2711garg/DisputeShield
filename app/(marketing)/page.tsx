import Link from "next/link";
import { HeroInvestigation } from "@/components/marketing/hero-investigation";
import { ProductStrip } from "@/components/marketing/product-strip";
import { Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="size-5 text-cyan" /> DisputeShield
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-muted hover:text-foreground">
            Sign in
          </Link>
          <Link href="/dashboard" className="rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-black">
            Open Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan">AI investigates. Humans decide.</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
            Fight chargebacks with evidence, not guesswork.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            DisputeShield investigates payment disputes, assembles merchant evidence and recommends the safest response — while keeping every financial decision human-approved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-lg bg-cyan px-5 py-3 text-sm font-medium text-black">
              Open Dashboard
            </Link>
            <Link href="/disputes/disp_hero_macbook" className="rounded-lg px-5 py-3 text-sm hairline">
              Watch Case Replay
            </Link>
          </div>
        </div>
        <HeroInvestigation />
      </section>
      <ProductStrip />

      <Section title="The problem" copy="A ₹60,000 laptop is delivered. The customer later claims it never arrived. Someone has to reconstruct payment, shipment, invoice and chat evidence before the deadline." />
      <Section title="The workflow" copy="Webhook in. Evidence collected. AI interprets messy conversations. Rules score the file. A human approves contest or accept. Razorpay is never written to without that click." />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-semibold">Evidence scoring is deterministic</h2>
        <p className="mt-3 max-w-2xl text-muted">
          The model does not invent a 92/100. Payment, billing, shipping, delivery, acknowledgement and consistency are scored in code so reviewers can audit every point.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            ["Payment", "15"],
            ["Shipping", "25"],
            ["Delivery", "15"],
            ["Acknowledgement", "15"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-surface p-4 hairline">
              <div className="text-sm text-muted">{label}</div>
              <div className="mt-2 text-3xl font-semibold text-cyan">{value}</div>
            </div>
          ))}
        </div>
      </section>
      <Section title="AI architecture" copy="OpenAI is used for reason interpretation, conversation analysis and contradiction language. SQL, arithmetic, webhook verification and permissions stay in TypeScript." />
      <Section title="Human in the loop" copy="Analysts can prepare packages. Only reviewers and admins can submit or accept. Accepting requires typing ACCEPT. Writes default to simulation." />
      <Section title="Held-out evaluation" copy="150 synthetic disputes. 50 never used for hand-tuning. Accuracy, contest precision/recall and estimated false-positive exposure live on the evaluation board." />
      <Section title="Razorpay" copy="Disputes, documents, and webhooks. Signature verification on the raw body. ENABLE_RAZORPAY_WRITES=false keeps every demo safe." />
      <Section title="Security & audit" copy="Organisation-scoped records, append-only audit logs, private evidence storage, role checks on the server, and no customer HTML rendering." />

      <footer className="border-t px-6 py-16 text-center">
        <p className="text-3xl font-semibold">AI investigates. Humans decide.</p>
        <Link href="/signup" className="mt-6 inline-block rounded-lg bg-cyan px-5 py-3 text-sm font-medium text-black">
          Start the demo
        </Link>
      </footer>
    </div>
  );
}

function Section({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-3xl text-lg text-muted">{copy}</p>
    </section>
  );
}
