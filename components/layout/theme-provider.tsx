"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemes } from "next-themes";
import { PaperRoom } from "@/components/motion/atmosphere";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("theme-ready");
  }, []);

  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
      <PaperRoom />
      {children}
    </NextThemes>
  );
}
