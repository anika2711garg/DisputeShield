"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/brand/logo";
import { ThemeSwitch } from "@/components/layout/theme-switch";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/dashboard";
  const [email, setEmail] = useState("admin@disputeshield.dev");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="aurora app-grid grid min-h-screen place-items-center px-4">
      <div className="absolute right-4 top-4 z-20">
        <ThemeSwitch />
      </div>
      <motion.form
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-[16px] bg-surface p-8 shadow-[var(--shadow)] hairline"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          setLoading(false);
          if (!response.ok) {
            setError("Authentication failed. Check the email and password.");
            return;
          }
          const data = await response.json().catch(() => ({ user: null }));
          router.push((data.user?.mustChangePassword ? "/settings/password" : next || "/dashboard") as Route);
        }}
      >
        <div className="mb-6">
          <BrandLogo size={32} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Signed session. Passwords are hashed. AI investigates. Humans decide.</p>
        <label className="mt-6 block text-sm">Email</label>
        <Input className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="mt-4 block text-sm">Password</label>
        <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <Button className="mt-6 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Continue"}
        </Button>
        <p className="mt-4 text-xs text-muted">
          admin@disputeshield.dev / reviewer@disputeshield.dev / analyst@disputeshield.dev · demo1234
        </p>
        <p className="mt-4 text-sm text-muted">
          No account? <Link href="/signup" className="text-cyan">Create one</Link>
        </p>
      </motion.form>
    </div>
  );
}
