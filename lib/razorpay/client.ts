import "server-only";

import { getEnv, isRazorpayConfigured } from "@/lib/env";
import { mockRazorpayAdapter } from "./mock";
import { assertRazorpayWritesEnabled } from "./writes";
import type {
  ContestPayload,
  RazorpayAdapter,
  RazorpayDispute,
  RazorpayDocument,
  RazorpayPayment,
  RazorpayWriteResult,
} from "./types";

class RealRazorpayAdapter implements RazorpayAdapter {
  mode: "test" | "live";
  private keyId: string;
  private keySecret: string;

  constructor(mode: "test" | "live", keyId: string, keySecret: string) {
    this.mode = mode;
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  private authHeader(): string {
    return `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
      ...init,
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Razorpay request failed (${response.status}): ${text.slice(0, 200)}`);
    }
    return (await response.json()) as T;
  }

  async fetchDisputes(): Promise<RazorpayDispute[]> {
    const data = await this.request<{ items: RazorpayDispute[] }>("/disputes");
    return data.items ?? [];
  }

  async fetchDispute(id: string): Promise<RazorpayDispute | null> {
    try {
      return await this.request<RazorpayDispute>(`/disputes/${id}`);
    } catch {
      return null;
    }
  }

  async fetchPayment(id: string): Promise<RazorpayPayment | null> {
    try {
      return await this.request<RazorpayPayment>(`/payments/${id}`);
    } catch {
      return null;
    }
  }

  async contestDispute(id: string, payload: ContestPayload): Promise<RazorpayWriteResult<RazorpayDispute>> {
    const simulated = assertRazorpayWritesEnabled();
    if (simulated) return simulated;
    return this.request<RazorpayDispute>(`/disputes/${id}/contest`, {
      method: "POST",
      body: JSON.stringify({
        amount: payload.amount,
        summary: payload.summary,
        action: payload.action,
        submitted_documents: payload.documentIds,
      }),
    });
  }

  async acceptDispute(id: string): Promise<RazorpayWriteResult<RazorpayDispute>> {
    const simulated = assertRazorpayWritesEnabled();
    if (simulated) return simulated;
    return this.request<RazorpayDispute>(`/disputes/${id}/accept`, { method: "POST" });
  }

  async uploadDocument(input: {
    filename: string;
    mimeType: string;
    bytes: Buffer;
  }): Promise<RazorpayWriteResult<RazorpayDocument>> {
    const simulated = assertRazorpayWritesEnabled();
    if (simulated) return simulated;
    const form = new FormData();
    form.set("purpose", "dispute_evidence");
    form.set(
      "file",
      new Blob([new Uint8Array(input.bytes)], { type: input.mimeType }),
      input.filename,
    );
    const response = await fetch("https://api.razorpay.com/v1/documents", {
      method: "POST",
      headers: { Authorization: this.authHeader() },
      body: form,
    });
    if (!response.ok) {
      throw new Error(`Razorpay document upload failed (${response.status})`);
    }
    return (await response.json()) as RazorpayDocument;
  }
}

let cached: RazorpayAdapter | null = null;

export function getRazorpayAdapter(): RazorpayAdapter {
  if (cached) return cached;
  const env = getEnv();
  if (env.RAZORPAY_MODE === "mock" || !isRazorpayConfigured()) {
    cached = mockRazorpayAdapter;
    return cached;
  }
  cached = new RealRazorpayAdapter(env.RAZORPAY_MODE === "live" ? "live" : "test", env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET);
  return cached;
}

export function razorpayRuntimeLabel(): { mode: "mock" | "test" | "live"; label: string } {
  const adapter = getRazorpayAdapter();
  if (adapter.mode === "mock") return { mode: "mock", label: "Razorpay Demo Mode" };
  if (adapter.mode === "test") return { mode: "test", label: "TEST MODE" };
  return { mode: "live", label: "LIVE MODE" };
}
