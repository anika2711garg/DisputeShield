import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { verifyRazorpaySignature } from "@/lib/razorpay/webhooks";
import { ingestWebhook } from "@/lib/services/webhook-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const secret = getEnv().RAZORPAY_WEBHOOK_SECRET;
  const signatureValid = secret ? verifyRazorpaySignature(rawBody, signature, secret) : getEnv().RAZORPAY_MODE === "mock";

  let payload: unknown = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!signatureValid && secret) {
    ingestWebhook(payload, false);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const result = ingestWebhook(payload, true);
  return NextResponse.json({ ok: true, ...result });
}
