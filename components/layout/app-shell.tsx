"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  Command,
  FileStack,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PlayCircle,
  Search,
  Settings,
  Shield,
  Sun,
  Plug,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import { NotificationBell } from "./notification-bell";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/disputes", label: "Disputes", icon: Shield },
  { href: "/evidence", label: "Evidence", icon: FileStack },
  { href: "/ai-evaluation", label: "AI Evaluation", icon: Bot },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/demo", label: "Demo", icon: PlayCircle },
] as const;

export function AppShell({
  children,
  user,
  modeLabel,
  aiLabel,
}: {
  children: React.ReactNode;
  user: { fullName: string; email: string; role: string };
  modeLabel: string;
  aiLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground">
      {menuOpen && (
        <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMenuOpen(false)} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-sunken px-4 py-5",
          menuOpen ? "flex" : "hidden md:flex",
        )}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <Shield className="size-5 text-cyan" />
            <span className="text-lg font-semibold tracking-tight">DisputeShield</span>
          </Link>
          <button type="button" className="grid size-8 place-items-center rounded-lg hairline md:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface hover:text-foreground",
                  active && "bg-surface text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t pt-4">
          <Link href="/settings/integrations" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-foreground">
            <Plug className="size-4" /> Integrations
          </Link>
          <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-foreground">
            <Settings className="size-4" /> Settings
          </Link>
          <div className="px-3 pt-3 text-xs text-muted">
            <div className="font-medium text-foreground">{user.fullName}</div>
            <div>{user.role}</div>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg hairline md:hidden"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 flex-1 items-center gap-2 rounded-lg bg-sunken px-3 text-sm text-muted hairline"
          >
            <Search className="size-4" />
            Search disputes, payments, customers
            <span className="ml-auto hidden items-center gap-1 text-[11px] md:flex">
              <Command className="size-3" />K
            </span>
          </button>
          <span className="hidden rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide text-amber md:inline">
            {modeLabel}
          </span>
          <span className="hidden rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide text-ai md:inline">
            {aiLabel}
          </span>
          <NotificationBell />
          <button
            type="button"
            aria-label="Toggle theme"
            className="grid size-10 place-items-center rounded-lg hairline"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            aria-label="Sign out"
            className="grid size-10 place-items-center rounded-lg hairline"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
          >
            <LogOut className="size-4" />
          </button>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  );
}
