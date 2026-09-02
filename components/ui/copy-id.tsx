"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyId({ value, className }: { value: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={cn("inline-flex items-center gap-1.5 font-mono text-[13px] text-muted transition hover:text-foreground", className)}
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setDone(true);
        toast.success("Copied");
        window.setTimeout(() => setDone(false), 1400);
      }}
      aria-label={`Copy ${value}`}
    >
      <span className="max-w-[220px] truncate">{value}</span>
      {done ? <Check className="size-3.5 text-emerald" /> : <Copy className="size-3.5 shrink-0" />}
    </button>
  );
}
