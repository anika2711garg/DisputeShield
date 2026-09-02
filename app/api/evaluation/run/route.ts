import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { canRunEvaluation } from "@/lib/auth/permissions";
import { runHeldOutEvaluation } from "@/lib/services/evaluation-service";

export async function POST() {
  const user = await requireSession();
  if (!canRunEvaluation(user.role)) return NextResponse.json({ error: "PERMISSION_DENIED" }, { status: 403 });
  return NextResponse.json(runHeldOutEvaluation());
}
