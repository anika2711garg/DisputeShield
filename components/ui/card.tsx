import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("sheet rounded-[6px] p-5 lift", className)}>{children}</section>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-[13px] font-medium text-muted", className)}>{children}</h2>;
}
