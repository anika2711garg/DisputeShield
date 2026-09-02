import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { syncFromRazorpay } from "@/lib/services/sync-service";

export async function POST() {
  const user = await requireSession();
  const result = await syncFromRazorpay(user.organizationId, user.id);
  return NextResponse.json(result);
}
