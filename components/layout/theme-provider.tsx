"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("theme-ready");
  }, []);

  return (
    <NextThemes attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
      {children}
    </NextThemes>
  );
}
