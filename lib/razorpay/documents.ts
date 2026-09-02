import "server-only";

import type { RazorpayAdapter, RazorpayDocument, RazorpayWriteResult } from "./types";

export async function uploadRazorpayDocument(
  adapter: RazorpayAdapter,
  input: { filename: string; mimeType: string; bytes: Buffer },
): Promise<RazorpayWriteResult<RazorpayDocument>> {
  return adapter.uploadDocument(input);
}
