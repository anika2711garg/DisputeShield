import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getDisputeBundle } from "@/lib/services/dispute-service";
import { buildContestPayload, razorpayContestBody } from "@/lib/razorpay/payload";
import { getWorkspaceSettings, razorpayModeSnapshot } from "@/lib/services/settings-service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const bundle = getDisputeBundle(user.organizationId, id);
  if (!bundle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const payload = buildContestPayload(bundle);
  return NextResponse.json({
    path: payload.path,
    method: payload.method,
    body: razorpayContestBody(payload),
    reason_code: payload.reason_code,
    razorpay: razorpayModeSnapshot(),
    settings: getWorkspaceSettings(),
  });
}
