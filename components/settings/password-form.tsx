"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function PasswordForm({ forced }: { forced?: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <h2 className="font-medium">{forced ? "Choose a new password" : "Change password"}</h2>
      <p className="mt-1 text-sm text-muted">
        {forced ? "This was a temporary invite password. Set one only you know." : "Minimum 8 characters. This does not change your role."}
      </p>
      <form
        className="mt-4 grid gap-3 md:max-w-md"
        onSubmit={async (event) => {
          event.preventDefault();
          if (next !== confirm) {
            toast.error("New passwords do not match");
            return;
          }
          setBusy(true);
          const response = await fetch("/api/auth/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ current, next }),
          });
          setBusy(false);
          if (!response.ok) {
            toast.error("Current password is wrong, or the new one is too short.");
            return;
          }
          toast.success("Password updated");
          setCurrent("");
          setNext("");
          setConfirm("");
          router.push("/dashboard");
          router.refresh();
        }}
      >
        <label className="text-sm">Current password</label>
        <Input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} required />
        <label className="text-sm">New password</label>
        <Input type="password" value={next} onChange={(event) => setNext(event.target.value)} required minLength={8} />
        <label className="text-sm">Confirm new password</label>
        <Input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required minLength={8} />
        <Button disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
      </form>
    </Card>
  );
}
