import "server-only";

import { assertRazorpayWritesEnabled } from "./writes";
import type {
  ContestPayload,
  RazorpayAdapter,
  RazorpayDispute,
  RazorpayDocument,
  RazorpayPayment,
} from "./types";

const disputes = new Map<string, RazorpayDispute>();
const payments = new Map<string, RazorpayPayment>();

function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

export function seedMockRazorpay(input: { disputes: RazorpayDispute[]; payments: RazorpayPayment[] }): void {
  for (const dispute of input.disputes) disputes.set(dispute.id, dispute);
  for (const payment of input.payments) payments.set(payment.id, payment);
}

export class MockRazorpayAdapter implements RazorpayAdapter {
  mode = "mock" as const;

  async fetchDisputes(): Promise<RazorpayDispute[]> {
    return [...disputes.values()];
  }

  async fetchDispute(id: string): Promise<RazorpayDispute | null> {
    return disputes.get(id) ?? null;
  }

  async fetchPayment(id: string): Promise<RazorpayPayment | null> {
    return payments.get(id) ?? null;
  }

  async contestDispute(id: string, payload: ContestPayload): Promise<RazorpayDispute | { simulated: true; message: string }> {
    const simulated = assertRazorpayWritesEnabled();
    const current = disputes.get(id);
    if (!current) {
      const created: RazorpayDispute = {
        id,
        payment_id: "pay_mock",
        amount: payload.amount,
        currency: "INR",
        reason_code: "product_not_received",
        reason_description: "Product not received",
        status: payload.action === "submit" ? "under_review" : "open",
        created_at: nowUnix(),
      };
      if (simulated) return simulated;
      disputes.set(id, created);
      return created;
    }
    if (simulated) return simulated;
    const next = {
      ...current,
      status: payload.action === "submit" ? ("under_review" as const) : current.status,
    };
    disputes.set(id, next);
    return next;
  }

  async acceptDispute(id: string): Promise<RazorpayDispute | { simulated: true; message: string }> {
    const simulated = assertRazorpayWritesEnabled();
    if (simulated) return simulated;
    const current = disputes.get(id);
    if (!current) {
      return {
        id,
        payment_id: "pay_mock",
        amount: 0,
        currency: "INR",
        reason_code: "other",
        reason_description: "Accepted",
        status: "lost",
        created_at: nowUnix(),
      };
    }
    const next = { ...current, status: "lost" as const };
    disputes.set(id, next);
    return next;
  }

  async uploadDocument(input: {
    filename: string;
    mimeType: string;
    bytes: Buffer;
  }): Promise<RazorpayDocument | { simulated: true; message: string }> {
    const simulated = assertRazorpayWritesEnabled();
    if (simulated) return simulated;
    return {
      id: `doc_mock_${Math.abs(input.bytes.length + input.filename.length)}`,
      purpose: "dispute_evidence",
      mime_type: input.mimeType,
      created_at: nowUnix(),
    };
  }
}

export const mockRazorpayAdapter = new MockRazorpayAdapter();
