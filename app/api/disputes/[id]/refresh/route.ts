import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getRazorpayAdapter } from "@/lib/razorpay/client";
import { getDisputeBundle } from "@/lib/services/dispute-service";
import { writeAudit } from "@/lib/services/audit-service";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const bundle = getDisputeBundle(user.organizationId, id);
  if (!bundle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const remote = await getRazorpayAdapter().fetchDispute(bundle.dispute.razorpayDisputeId);
  writeAudit({
    organizationId: user.organizationId,
    disputeId: id,
    actorType: "user",
    actorId: user.id,
    action: "dispute.refreshed",
    metadata: { found: Boolean(remote) },
  });
  return NextResponse.json({ remote });
}
