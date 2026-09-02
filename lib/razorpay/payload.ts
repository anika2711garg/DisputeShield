import type { CaseBundle } from "@/types/case";
import { toRazorpayReasonCode } from "./reason-codes";
import type { ContestPayload } from "./types";

export function buildContestPayload(bundle: CaseBundle, selectedEvidenceIds?: string[]): ContestPayload & {
  path: string;
  method: "POST";
  amount_paise: number;
  reason_code: string;
} {
  const ids = selectedEvidenceIds ?? bundle.evidence.filter((item) => item.includedInContest).map((item) => item.id);
  const amountPaise = Math.round(bundle.dispute.amount * 100);
  return {
    amount: amountPaise,
    amount_paise: amountPaise,
    summary: bundle.draft?.summary ?? bundle.investigation?.summary ?? "Merchant contest package assembled by DisputeShield.",
    documentIds: ids,
    action: "submit",
    path: `/v1/disputes/${bundle.dispute.razorpayDisputeId}/contest`,
    method: "POST",
    reason_code: toRazorpayReasonCode(bundle.dispute.reasonCode),
  };
}

export function razorpayContestBody(payload: ReturnType<typeof buildContestPayload>) {
  return {
    amount: payload.amount_paise,
    action: payload.action,
    summary: payload.summary,
    submitted_documents: payload.documentIds,
  };
}
