import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { simulateThreshold } from "@/lib/services/lab-service";
import { getWorkspaceSettings } from "@/lib/services/settings-service";

export async function GET(request: Request) {
  const user = await requireSession();
  const url = new URL(request.url);
  const threshold = Number(url.searchParams.get("score") ?? getWorkspaceSettings().contestThreshold);
  const safe = Number.isFinite(threshold) ? Math.min(99, Math.max(50, threshold)) : 80;
  return NextResponse.json(simulateThreshold(user.organizationId, safe));
}
