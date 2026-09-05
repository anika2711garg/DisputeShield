"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { UserRole } from "@/types/domain";

type Member = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export function TeamPanel({ members, me, canManage }: { members: Member[]; me: string; canManage: boolean }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("reviewer");
  const [busy, setBusy] = useState(false);
  const [inviteSecret, setInviteSecret] = useState<{ email: string; temporaryPassword: string } | null>(null);

  async function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <Card>
          <h2 className="font-medium">Invite a teammate</h2>
          <p className="mt-1 text-sm text-muted">They get a one-time password. Analysts can investigate but cannot contest or accept.</p>
          <form
            className="mt-4 grid gap-3 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              const response = await fetch("/api/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, email, role }),
              });
              const data = await response.json();
              setBusy(false);
              if (!response.ok) {
                toast.error(data.error === "email_taken" ? "Email already in use" : "Invite failed");
                return;
              }
              setInviteSecret({ email: data.profile.email, temporaryPassword: data.temporaryPassword });
              toast.success("Invite created. Copy the one-time password below.");
              setFullName("");
              setEmail("");
              await refresh();
            }}
          >
            <Input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            <Input placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <select className="h-10 rounded-[10px] bg-surface px-3 text-sm hairline" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="reviewer">Reviewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
            <Button disabled={busy}>{busy ? "Inviting…" : "Invite"}</Button>
          </form>
          {inviteSecret && (
            <div className="mt-4 rounded-[10px] bg-sunken px-3 py-3 text-sm">
              <div className="font-medium">One-time password for {inviteSecret.email}</div>
              <p className="mt-1 text-muted">Copy this now. They must change it on first login.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded-md bg-surface px-2 py-1 font-mono text-xs">{inviteSecret.temporaryPassword}</code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(inviteSecret.temporaryPassword);
                    toast.success("Copied");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
      <div className="space-y-2">
        {members.map((member) => (
          <article key={member.id} className="sheet flutter flex flex-wrap items-center justify-between gap-3 rounded-[6px] px-4 py-3">
            <div>
              <div className="font-medium">
                {member.fullName}
                {member.id === me ? " (you)" : ""}
              </div>
              <div className="text-xs text-muted">
                {member.email} · {member.role}
              </div>
            </div>
            {canManage && member.id !== me && (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 rounded-[10px] bg-surface px-2 text-xs hairline"
                  value={member.role}
                  onChange={async (event) => {
                    const next = event.target.value as UserRole;
                    const response = await fetch("/api/team", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ memberId: member.id, role: next }),
                    });
                    if (!response.ok) toast.error("Could not change role");
                    else toast.success("Role updated");
                    await refresh();
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="analyst">Analyst</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const response = await fetch("/api/team", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ memberId: member.id, resetPassword: true }),
                    });
                    const data = await response.json();
                    if (!response.ok) toast.error("Reset failed");
                    else {
                      setInviteSecret({ email: member.email, temporaryPassword: data.temporaryPassword });
                      toast.success("Password reset. Copy it below — it will not be shown again.");
                    }
                  }}
                >
                  Reset password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const response = await fetch("/api/team", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ memberId: member.id }),
                    });
                    if (!response.ok) toast.error("Remove failed");
                    else toast.success("Removed");
                    await refresh();
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
