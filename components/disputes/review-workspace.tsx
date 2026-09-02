"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CaseBundle } from "@/types/case";
import { formatInr } from "@/lib/utils";
import { evidenceCategoryLabel } from "@/lib/rules/evidence-requirements";
import { canSubmitFinancialAction } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types/domain";
import { EvidencePreviewDrawer } from "./evidence-preview-drawer";
import { EvidenceUpload } from "./evidence-upload";

export function ReviewWorkspace({ bundle, role }: { bundle: CaseBundle; role: UserRole }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(
    bundle.draft?.selectedEvidenceIds ?? bundle.evidence.filter((item) => item.includedInContest).map((item) => item.id),
  );
  const [active, setActive] = useState(bundle.evidence[0]?.id);
  const [contestOpen, setContestOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [ack, setAck] = useState(false);
  const [typed, setTyped] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = bundle.evidence.find((item) => item.id === active);
  const canAct = canSubmitFinancialAction(role);

  const groups = useMemo(() => {
    const map = new Map<string, typeof bundle.evidence>();
    for (const item of bundle.evidence) {
      const key = evidenceCategoryLabel(item.type);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [bundle]);

  async function saveDraft() {
    const response = await fetch(`/api/disputes/${bundle.dispute.id}/contest/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedEvidenceIds: selected,
        summary: bundle.investigation?.summary ?? "Merchant contest package",
      }),
    });
    if (response.ok) toast.success("Draft saved locally");
    else toast.error("Could not save draft");
  }

  async function submit() {
    const response = await fetch(`/api/disputes/${bundle.dispute.id}/contest/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedEvidenceIds: selected, acknowledged: true }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error === "PERMISSION_DENIED" ? "Analysts cannot submit financial actions." : "Submit failed");
      return;
    }
    toast.success(data.simulated ? "Simulation mode — no financial action was sent to Razorpay." : "Contest submitted");
    setContestOpen(false);
    router.refresh();
  }

  async function accept() {
    const response = await fetch(`/api/disputes/${bundle.dispute.id}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "ACCEPT" }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error === "PERMISSION_DENIED" ? "Not authorised." : "Accept failed");
      return;
    }
    toast.success(data.simulated ? "Simulation mode — no financial action was sent to Razorpay." : "Dispute accepted");
    setAcceptOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Review workspace</h1>
        <p className="text-muted">{bundle.dispute.id} · {formatInr(bundle.dispute.amount)}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[260px_1fr_320px]">
        <aside className="space-y-3 rounded-2xl bg-surface p-4 hairline">
          <div className="text-xs uppercase text-muted">Case</div>
          <div>{bundle.customer?.name}</div>
          <div className="text-sm text-muted">{bundle.order?.externalId}</div>
          <div className="text-sm">{bundle.shipment ? `${bundle.shipment.status} · ${bundle.shipment.trackingId}` : "No shipment"}</div>
        </aside>
        <section className="rounded-2xl bg-surface p-5 hairline">
          <EvidenceUpload disputeId={bundle.dispute.id} />
          {current ? (
            <>
              <div className="mt-5 text-xs text-muted">{current.id}</div>
              <h2 className="mt-1 text-xl font-semibold">{current.title}</h2>
              {current.storagePath && String(current.metadata.mimeType ?? "").startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/evidence/${current.id}/file`} alt={current.title} className="mt-4 max-h-72 w-full rounded-xl object-contain bg-sunken" />
              ) : current.storagePath && current.metadata.mimeType === "application/pdf" ? (
                <iframe title={current.title} src={`/api/evidence/${current.id}/file`} className="mt-4 h-72 w-full rounded-xl border-0 bg-sunken" />
              ) : (
                <p className="mt-4 whitespace-pre-wrap text-sm">{current.contentText}</p>
              )}
              <p className="mt-4 text-xs text-muted">
                {current.storagePath ? `Private path ${current.storagePath}. No OCR was performed.` : "Structured merchant record. Source preview."}
              </p>
              <Button className="mt-3" variant="outline" onClick={() => setDrawerOpen(true)}>
                Open preview drawer
              </Button>
            </>
          ) : (
            <p>Select evidence.</p>
          )}
        </section>
        <aside className="rounded-2xl bg-surface p-4 hairline">
          <div className="text-xs uppercase text-muted">Contest package</div>
          <div className="mt-2 text-sm">{selected.length} documents selected</div>
          <div className="mt-1 text-sm">Recommendation: {bundle.recommendation?.finalRecommendation}</div>
          <div className="mt-4 space-y-3">
            {groups.map(([name, items]) => (
              <div key={name}>
                <div className="mb-1 text-xs text-muted">{name}</div>
                {items.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => {
                        setSelected((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]));
                        setActive(item.id);
                      }}
                    />
                    {item.title}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </aside>
      </div>
      <div className="sticky bottom-3 flex flex-wrap gap-2 rounded-2xl bg-surface p-3 hairline">
        <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
        <Button disabled={!canAct} onClick={() => setContestOpen(true)}>Approve & Contest</Button>
        <Button variant="danger" disabled={!canAct} onClick={() => setAcceptOpen(true)}>Accept Dispute</Button>
        {!canAct && <Badge tone="amber">Analysts can prepare, not submit</Badge>}
      </div>

      {contestOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 hairline">
            <h3 className="text-xl font-semibold">Submit evidence to Razorpay</h3>
            <p className="mt-3 text-sm text-muted">Dispute {bundle.dispute.id} · {formatInr(bundle.dispute.amount)} · {selected.length} documents. This action sends the case for review.</p>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
              I reviewed the evidence and approve this contest.
            </label>
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" onClick={() => setContestOpen(false)}>Cancel</Button>
              <Button disabled={!ack} onClick={submit}>Submit Contest</Button>
            </div>
          </div>
        </div>
      )}

      {acceptOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 hairline">
            <h3 className="text-xl font-semibold text-danger">Accepting this dispute is irreversible.</h3>
            <p className="mt-3 text-sm text-muted">Type ACCEPT to continue.</p>
            <input className="mt-4 h-10 w-full rounded-lg bg-sunken px-3 hairline" value={typed} onChange={(e) => setTyped(e.target.value)} />
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" onClick={() => setAcceptOpen(false)}>Cancel</Button>
              <Button variant="danger" disabled={typed !== "ACCEPT"} onClick={accept}>Accept Dispute</Button>
            </div>
          </div>
        </div>
      )}
      <EvidencePreviewDrawer
        item={drawerOpen ? current ?? null : null}
        onClose={() => setDrawerOpen(false)}
        onToggle={(id, included) => {
          setSelected((prev) => (included ? [...new Set([...prev, id])] : prev.filter((value) => value !== id)));
        }}
      />
    </div>
  );
}
