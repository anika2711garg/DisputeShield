"use client";

import type { ReactNode } from "react";
import { PeekTrigger } from "@/components/ui/case-peek";
import type { CasePeekData } from "@/lib/ui/peek";

export function CaseRowPeek({
  id,
  seed,
  children,
}: {
  id: string;
  seed?: Partial<CasePeekData>;
  children: ReactNode;
}) {
  return (
    <PeekTrigger id={id} seed={seed}>
      {children}
    </PeekTrigger>
  );
}
