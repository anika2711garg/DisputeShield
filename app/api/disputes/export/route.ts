import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { disputesToCsv, listDisputes } from "@/lib/services/dispute-service";

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
  });
  return new NextResponse(disputesToCsv(items), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=disputes.csv",
      "Cache-Control": "private, no-store",
    },
  });
}
