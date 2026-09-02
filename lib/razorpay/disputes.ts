import "server-only";

import type { ContestPayload, RazorpayDispute, RazorpayPayment, RazorpayWriteResult } from "./types";
import type { RazorpayAdapter } from "./types";

export async function listRazorpayDisputes(adapter: RazorpayAdapter): Promise<RazorpayDispute[]> {
  return adapter.fetchDisputes();
}

export async function getRazorpayDispute(adapter: RazorpayAdapter, id: string): Promise<RazorpayDispute | null> {
  return adapter.fetchDispute(id);
}

export async function getRazorpayPayment(adapter: RazorpayAdapter, id: string): Promise<RazorpayPayment | null> {
  return adapter.fetchPayment(id);
}

export async function contestRazorpayDispute(
  adapter: RazorpayAdapter,
  id: string,
  payload: ContestPayload,
): Promise<RazorpayWriteResult<RazorpayDispute>> {
  return adapter.contestDispute(id, payload);
}

export async function acceptRazorpayDispute(
  adapter: RazorpayAdapter,
  id: string,
): Promise<RazorpayWriteResult<RazorpayDispute>> {
  return adapter.acceptDispute(id);
}
