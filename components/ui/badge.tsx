import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "cyan" | "emerald" | "amber" | "danger" | "ai";
  children: React.ReactNode;
}) {
  const tones = {
    muted: "text-muted hairline",
    cyan: "text-cyan border-cyan/30 bg-cyan/10",
    emerald: "text-emerald border-emerald/30 bg-emerald/10",
    amber: "text-amber border-amber/30 bg-amber/10",
    danger: "text-danger border-danger/30 bg-danger/10",
    ai: "text-ai border-ai/30 bg-ai/10",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
