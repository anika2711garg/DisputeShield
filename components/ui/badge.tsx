import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "cyan" | "emerald" | "amber" | "danger" | "ai" | "electric";
  children: React.ReactNode;
}) {
  const tones = {
    muted: "text-muted bg-sunken border-transparent",
    cyan: "text-cyan bg-cyan/10 border-cyan/15",
    electric: "text-electric bg-electric/10 border-electric/15",
    emerald: "text-emerald bg-emerald/10 border-emerald/15",
    amber: "text-amber bg-amber/10 border-amber/15",
    danger: "text-danger bg-danger/10 border-danger/15",
    ai: "text-violet bg-violet/10 border-violet/15",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
