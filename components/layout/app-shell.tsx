"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  FileStack,
  FlaskConical,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PlayCircle,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/logo";
import { CommandPalette } from "./command-palette";
import { NotificationBell } from "./notification-bell";
import { ModeToggles } from "./mode-toggles";
import { ThemeSwitch } from "./theme-switch";
import { JudgeTour } from "./judge-tour";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tint: "text-electric" },
  { href: "/disputes", label: "Disputes", icon: Shield, tint: "text-primary" },
  { href: "/queue", label: "Queue", icon: ListChecks, tint: "text-amber" },
  { href: "/webhooks", label: "Webhooks", icon: Inbox, tint: "text-cyan" },
  { href: "/orders", label: "Orders", icon: ShoppingBag, tint: "text-cyan" },
  { href: "/customers", label: "Customers", icon: Users, tint: "text-teal" },
  { href: "/evidence", label: "Evidence", icon: FileStack, tint: "text-emerald" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, tint: "text-violet" },
  { href: "/lab", label: "Rules lab", icon: FlaskConical, tint: "text-violet" },
  { href: "/activity", label: "Activity", icon: Activity, tint: "text-amber" },
  { href: "/ai-evaluation", label: "AI Evaluation", icon: Bot, tint: "text-violet" },
  { href: "/demo", label: "Demo Center", icon: PlayCircle, tint: "text-cyan" },
  { href: "/settings/team", label: "Team", icon: Users, tint: "text-teal" },
] as const;

function crumbs(pathname: string): { href: string; label: string }[] {
  const parts = pathname.split("/").filter(Boolean);
  const items: { href: string; label: string }[] = [{ href: "/dashboard", label: "Home" }];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    if (part === "dashboard") continue;
    const label =
      part === "ai-evaluation"
        ? "AI Evaluation"
        : part === "disp_hero_macbook"
          ? "MacBook case"
          : part.replaceAll("-", " ").replace(/^\w/, (c) => c.toUpperCase());
    items.push({ href: acc, label });
  }
  return items;
}

export function AppShell({
  children,
  user,
  modeLabel,
  aiLabel,
  writeArmed,
  writesEnvEnabled,
}: {
  children: ReactNode;
  user: { fullName: string; email: string; role: string };
  modeLabel: string;
  aiLabel: string;
  writeArmed: boolean;
  writesEnvEnabled: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setMenuOpen(false), 0);
    return () => window.clearTimeout(handle);
  }, [pathname]);

  return (
    <div className="app-grid min-h-screen bg-background text-foreground">
      <AnimatePresence>
        {menuOpen && (
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
            onClick={() => setMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[248px] flex-col border-r border-violet/10 bg-sidebar px-3 py-5 transition-transform duration-300 md:translate-x-0",
          menuOpen ? "flex translate-x-0" : "hidden md:flex",
        )}
      >
        <div className="mb-7 flex items-center justify-between px-2">
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
            <BrandLogo size={30} />
          </Link>
          <button type="button" className="grid size-8 place-items-center rounded-lg md:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) || (item.href === "/dashboard" && pathname === "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[var(--sidebar-muted)] transition duration-150 hover:bg-surface hover:text-foreground",
                  active && "bg-surface text-foreground shadow-[var(--shadow)]",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-rail"
                    className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={cn("size-4", active ? item.tint : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-0.5 border-t border-violet/10 pt-3">
          <div className="mb-2 px-1 md:hidden">
            <ModeToggles writeArmed={writeArmed} writesEnvEnabled={writesEnvEnabled} />
          </div>
          <Link href="/docs" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[var(--sidebar-muted)] hover:bg-surface hover:text-foreground">
            <BookOpen className="size-4" /> Documentation
          </Link>
          <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[var(--sidebar-muted)] hover:bg-surface hover:text-foreground">
            <Settings className="size-4" /> Settings
          </Link>
          <Link href="/settings/password" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[var(--sidebar-muted)] hover:bg-surface hover:text-foreground">
            Password
          </Link>
          <div className="mt-2 flex items-center gap-2.5 rounded-[10px] bg-surface px-2.5 py-2 hairline">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">{initials}</span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium">{user.fullName}</div>
              <div className="truncate text-[11px] capitalize text-muted">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-violet/10 bg-background/80 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-[10px] bg-surface hairline md:hidden"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-4" />
          </button>
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-[13px] text-muted md:flex">
            {crumbs(pathname).map((item, index, all) => (
              <span key={item.href} className="flex items-center gap-1">
                {index > 0 && <span className="text-violet/30">/</span>}
                <Link href={item.href as never} className={index === all.length - 1 ? "truncate font-medium text-foreground" : "hover:text-foreground"}>
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-surface px-3 text-sm text-muted hairline md:max-w-sm"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search disputes, orders, customers</span>
            <kbd className="ml-auto hidden rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[10px] md:inline-flex">⌘K</kbd>
          </button>
          <ThemeSwitch />
          <JudgeTour />
          <span className="hidden rounded-full bg-amber/10 px-2.5 py-1 text-[11px] font-medium text-amber lg:inline" title={modeLabel}>
            {writeArmed ? "Armed" : "Sim"}
          </span>
          <span className="hidden rounded-full bg-violet/10 px-2.5 py-1 text-[11px] font-medium text-violet lg:inline">{aiLabel}</span>
          <NotificationBell />
          <span className="hidden size-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white md:grid" title={user.fullName}>
            {initials}
          </span>
          <button
            type="button"
            aria-label="Sign out"
            className="grid size-10 place-items-center rounded-[10px] bg-surface hairline"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-2 border-t border-violet/10 bg-surface/70 px-4 py-2"
        >
          <ModeToggles writeArmed={writeArmed} writesEnvEnabled={writesEnvEnabled} />
          <p className="hidden text-[11px] text-muted md:block">Light/dark and Razorpay write mode</p>
        </motion.div>
        </header>
        <main className="px-4 py-5 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.85, y: -4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  );
}
