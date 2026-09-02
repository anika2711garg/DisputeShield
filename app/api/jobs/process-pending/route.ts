import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { getStore } from "@/lib/db/local-store";
import { investigateDispute } from "@/lib/services/investigation-service";

export async function POST(request: Request) {
  const secret = getEnv().CRON_SECRET;
  const header = request.headers.get("authorization");
  if (secret && header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const store = getStore();
  const pending = store.disputes.filter((item) => !store.aiInvestigations.some((inv) => inv.disputeId === item.id)).slice(0, 5);
  const processed = [];
  for (const dispute of pending) {
    processed.push(await investigateDispute(dispute.organizationId, dispute.id, "cron"));
  }
  return NextResponse.json({ processed: processed.length });
}
