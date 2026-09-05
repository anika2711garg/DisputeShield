"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeSwitch({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Dark mode on. Switch to light." : "Light mode on. Switch to dark."}
      disabled={!mounted}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "relative h-9 w-[72px] shrink-0 overflow-hidden rounded-full p-1 shadow-inner transition-colors duration-500",
        dark ? "bg-[#1a2421]" : "bg-gradient-to-b from-teal-300 to-teal-400",
        className,
      )}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className="absolute left-2 top-1.5 size-0.5 rounded-full bg-white/90" />
        <span className="absolute left-4 top-3.5 size-1 rounded-full bg-white/70" />
        <span className="absolute left-3 top-6 size-0.5 rounded-full bg-white/80" />
        <span className="absolute left-[18px] top-2 size-0.5 rounded-full bg-white/60" />
      </motion.span>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -right-1 top-1 size-6 rounded-full bg-white/25"
        animate={{ x: dark ? 8 : 0, opacity: dark ? 0 : 0.7 }}
        transition={{ duration: 0.4 }}
      />
      <motion.span
        className="absolute top-1 z-10 grid size-7 place-items-center rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.25)]"
        animate={{ x: dark ? 36 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
      >
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ rotate: dark ? -90 : 90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="grid place-items-center"
        >
          {dark ? <Moon className="size-3.5 fill-teal-800 text-teal-800" /> : <Sun className="size-3.5 fill-amber-400 text-amber-500" />}
        </motion.span>
      </motion.span>
    </button>
  );
}
