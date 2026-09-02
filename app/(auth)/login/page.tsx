"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="grid min-h-screen place-items-center px-4">
      <form
        className="w-full max-w-md rounded-3xl bg-surface p-8 hairline"
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
            setError("Authentication failed. Use a demo account.");
            return;
          }
          router.push((next || "/dashboard") as Route);
        }}
      >
        <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
          <Shield className="size-5 text-cyan" /> DisputeShield
        </div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Demo auth is enabled until Supabase is connected.</p>
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
      </form>
    </div>
  );
}
