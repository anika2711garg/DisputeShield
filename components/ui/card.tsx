import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-[14px] bg-surface p-5 hairline lift", className)}>{children}</section>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-[13px] font-medium text-muted", className)}>{children}</h2>;
}
