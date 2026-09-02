import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-[var(--radius)] bg-surface hairline p-5", className)}>{children}</section>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-sm font-medium text-muted", className)}>{children}</h2>;
}
