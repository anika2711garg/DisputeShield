"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/brand/logo";
import { ThemeSwitch } from "@/components/layout/theme-switch";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loadDemo, setLoadDemo] = useState(true);
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
        className="relative z-10 w-full max-w-md rounded-[16px] bg-surface p-8 shadow-[var(--shadow)] hairline"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, password, workspaceName, loadDemo }),
          });
          setLoading(false);
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            setError(data.error === "email_taken" ? "That email already has a workspace." : "Could not create the workspace.");
            return;
          }
          router.push("/dashboard");
        }}
      >
        <BrandLogo size={32} />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Create a workspace</h1>
        <p className="mt-2 text-sm text-muted">You become the admin. Invite reviewers later. AI still cannot contest.</p>
        <label className="mt-6 block text-sm">Your name</label>
        <Input className="mt-1" value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} />
        <label className="mt-4 block text-sm">Work email</label>
        <Input className="mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label className="mt-4 block text-sm">Password</label>
        <Input className="mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
        <label className="mt-4 block text-sm">Workspace name</label>
        <Input className="mt-1" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} required minLength={2} />
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input className="mt-1" type="checkbox" checked={loadDemo} onChange={(event) => setLoadDemo(event.target.checked)} />
          <span>Load the sample MacBook desk so you can walk the product immediately.</span>
        </label>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <Button className="mt-6 w-full" disabled={loading}>
          {loading ? "Creating…" : "Create workspace"}
        </Button>
        <p className="mt-4 text-sm text-muted">
          Already have an account? <Link href="/login" className="text-cyan">Sign in</Link>
        </p>
      </motion.form>
    </div>
  );
}
