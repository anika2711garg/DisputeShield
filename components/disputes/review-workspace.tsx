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
import { ConfirmDecisionDialog } from "./confirm-decision-dialog";

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
        <h1 className="display text-3xl italic">Review workspace</h1>
        <p className="text-muted">{bundle.dispute.id} · {formatInr(bundle.dispute.amount)}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[260px_1fr_320px]">
        <aside className="sheet flutter space-y-3 rounded-[6px] p-4">
          <div className="text-xs uppercase text-muted">Case</div>
          <div>{bundle.customer?.name}</div>
          <div className="text-sm text-muted">{bundle.order?.externalId}</div>
          <div className="text-sm">{bundle.shipment ? `${bundle.shipment.status} · ${bundle.shipment.trackingId}` : "No shipment"}</div>
        </aside>
        <section className="sheet flutter rounded-[6px] p-5">
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
        <aside className="sheet flutter rounded-[6px] p-4">
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
      <div className="sheet sticky bottom-3 space-y-3 rounded-[6px] p-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Final decision</div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          I have reviewed the evidence and understand this action.
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
          <Button disabled={!canAct || !ack} onClick={() => setContestOpen(true)}>Contest Chargeback</Button>
          <Button variant="danger" disabled={!canAct || !ack} onClick={() => setAcceptOpen(true)}>Accept Dispute</Button>
          {!canAct && <Badge tone="amber">Analysts can prepare, not submit</Badge>}
        </div>
        <p className="text-xs text-muted">Razorpay writes disabled — demo action only.</p>
      </div>

      {contestOpen && (
        <ConfirmDecisionDialog
          action="contest"
          amount={bundle.dispute.amount}
          caseId={bundle.dispute.id}
          onCancel={() => setContestOpen(false)}
          onConfirm={submit}
        />
      )}

      {acceptOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#241c14]/40 p-4">
          <div className="sheet w-full max-w-md rounded-[6px] p-6">
            <h3 className="text-lg font-semibold text-danger">Accept this dispute?</h3>
            <p className="mt-3 text-sm text-muted">DisputeShield will not take this action automatically. You are making the final decision.</p>
            <p className="mt-2 text-sm">Type ACCEPT to continue. {formatInr(bundle.dispute.amount)}</p>
            <input className="mt-4 h-10 w-full rounded-[4px] bg-white px-3 hairline" value={typed} onChange={(e) => setTyped(e.target.value)} />
            <div className="ticket mt-4 rounded-[4px] bg-amber/8 px-3 py-2 text-xs font-medium text-amber">Razorpay writes disabled — demo action only</div>
            <div className="mt-6 flex justify-end gap-2">
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
