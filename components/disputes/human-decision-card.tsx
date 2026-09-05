"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Shield } from "lucide-react";
import type { CaseBundle } from "@/types/case";
import type { UserRole } from "@/types/domain";
import { canSubmitFinancialAction } from "@/lib/auth/permissions";
import { recommendationLabel } from "@/lib/ui/labels";
import { Button } from "@/components/ui/button";
import { ConfirmDecisionDialog } from "./confirm-decision-dialog";

export function HumanDecisionCard({ bundle, role }: { bundle: CaseBundle; role: UserRole | string }) {
  const router = useRouter();
  const rec = bundle.recommendation;
  const canAct = canSubmitFinancialAction(role as UserRole);
  const [ack, setAck] = useState(false);
  const [action, setAction] = useState<"contest" | "accept" | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(next: "contest" | "accept") {
    setBusy(true);
    const url = next === "contest" ? `/api/disputes/${bundle.dispute.id}/contest/submit` : `/api/disputes/${bundle.dispute.id}/accept`;
    const body =
      next === "contest"
        ? { selectedEvidenceIds: bundle.evidence.filter((item) => item.includedInContest).map((item) => item.id), acknowledged: true }
        : { confirm: "ACCEPT" };
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    setBusy(false);
    setAction(null);
    if (!response.ok) {
      toast.error(data.error === "PERMISSION_DENIED" ? "This role cannot submit financial actions." : "Action failed");
      return;
    }
    toast.success(data.simulated ? "Simulation mode — no financial action was sent to Razorpay." : next === "contest" ? "Contest submitted" : "Dispute accepted");
    router.refresh();
  }

  return (
    <motion.div
      className="decision-glow relative rounded-[8px] bg-[#241c14] p-5 text-[#f4ead8]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <motion.span
            className="grid size-10 place-items-center rounded-full bg-white/8"
            animate={{ boxShadow: ["0 0 0 0 rgba(34,211,238,0.35)", "0 0 0 10px rgba(34,211,238,0)", "0 0 0 0 rgba(34,211,238,0.35)"] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <Shield className="size-4 text-cyan-300" />
          </motion.span>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Human decision required</div>
            <h2 className="display mt-1 text-2xl italic">Only a reviewer can submit this.</h2>
          </div>
        </div>
        <span className="stamp">Writes off</span>
      </div>
      <p className="mt-3 text-sm text-slate-400">AI and rules can recommend an action. They cannot contest or accept.</p>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <div className="ticket rounded-[4px] bg-violet-500/15 px-3 py-2">
          AI <span className="float-right font-medium text-violet-200">{recommendationLabel(rec?.modelRecommendation)}</span>
        </div>
        <div className="ticket rounded-[4px] bg-cyan-500/15 px-3 py-2">
          Rules <span className="float-right font-medium text-cyan-200">{recommendationLabel(rec?.rulesRecommendation)}{rec?.score != null ? ` · ${rec.score}/100` : ""}</span>
        </div>
        <div className="ticket rounded-[4px] bg-white/8 px-3 py-2">
          You <span className="float-right font-medium text-white">Pending</span>
        </div>
      </div>
      <label className="mt-4 flex items-start gap-2 text-sm text-slate-200">
        <input type="checkbox" className="mt-1" checked={ack} onChange={(event) => setAck(event.target.checked)} />
        I have reviewed the evidence and understand this action.
      </label>
      {!canAct && <p className="mt-2 text-xs text-amber-300">Analysts can prepare a package. Only reviewers and admins can contest or accept.</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={!ack || !canAct} onClick={() => setAction("contest")}>
          Contest Chargeback
        </Button>
        <Button variant="danger" disabled={!ack || !canAct} onClick={() => setAction("accept")}>
          Accept
        </Button>
      </div>
      {action && (
        <ConfirmDecisionDialog
          action={action}
          amount={bundle.dispute.amount}
          caseId={bundle.dispute.id}
          busy={busy}
          onCancel={() => setAction(null)}
          onConfirm={() => submit(action)}
        />
      )}
    </motion.div>
  );
}
