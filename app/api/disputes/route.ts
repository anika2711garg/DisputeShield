import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listDisputes } from "@/lib/services/dispute-service";

export async function GET(request: Request) {
  const user = await requireSession();
  const url = new URL(request.url);
  const items = listDisputes(user.organizationId, {
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    reason: url.searchParams.get("reason") ?? undefined,
    recommendation: url.searchParams.get("recommendation") ?? undefined,
    phase: url.searchParams.get("phase") ?? undefined,
    view: url.searchParams.get("view") ?? undefined,
    minScore: num(url.searchParams.get("minScore")),
    maxScore: num(url.searchParams.get("maxScore")),
  });
  return NextResponse.json({ items });
}

function num(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
