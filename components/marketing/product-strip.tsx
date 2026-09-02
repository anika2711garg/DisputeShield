export function ProductStrip() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Inside the command centre</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Frame title="Risk dashboard" caption="Amount at risk, contest-ready, win rate">
          <div className="grid grid-cols-3 gap-2">
            {["₹4.82L", "18", "82%"].map((value) => (
              <div key={value} className="rounded-lg bg-sunken p-2">
                <div className="text-[10px] text-muted">KPI</div>
                <div className="text-sm font-semibold text-cyan">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 h-16 rounded-lg bg-sunken">
            <div className="flex h-full items-end gap-1 px-2 pb-2">
              {[40, 70, 55, 90, 60, 80].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-cyan/70" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </Frame>
        <Frame title="MacBook case" caption="₹60,000 · Product not received">
          <div className="flex items-center gap-3">
            <div className="grid size-16 place-items-center rounded-full border-4 border-cyan text-sm font-semibold">92</div>
            <div className="text-xs text-muted">
              Case readiness
              <div className="mt-1 text-foreground">Contest recommended</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-emerald/10 px-3 py-2 text-xs text-emerald">Got the laptop, thanks!</div>
        </Frame>
        <Frame title="Human review" caption="AI investigates. Humans decide.">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between rounded-lg bg-sunken px-3 py-2">
              <span>AI</span>
              <span className="text-emerald">Contest</span>
            </div>
            <div className="flex justify-between rounded-lg bg-sunken px-3 py-2">
              <span>Rules</span>
              <span className="text-emerald">Contest</span>
            </div>
            <div className="flex justify-between rounded-lg bg-sunken px-3 py-2">
              <span>Final</span>
              <span className="text-cyan">Human approved</span>
            </div>
          </div>
        </Frame>
      </div>
    </section>
  );
}

function Frame({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface p-4 hairline">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-danger/70" />
        <span className="size-2 rounded-full bg-amber/70" />
        <span className="size-2 rounded-full bg-emerald/70" />
        <span className="ml-2 text-xs text-muted">{title}</span>
      </div>
      {children}
      <p className="mt-3 text-xs text-muted">{caption}</p>
    </div>
  );
}
