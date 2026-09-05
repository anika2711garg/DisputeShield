"use client";

import type { ReactNode } from "react";

export function FileDownload({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => {
      window.location.assign(href);
    }}>
      {children}
    </button>
  );
}
