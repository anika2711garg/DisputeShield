import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { processPendingJobs } from "@/lib/services/ops-service";

export async function POST(request: Request) {
  const secret = getEnv().CRON_SECRET;
  const header = request.headers.get("authorization");
  const cronOk = Boolean(secret) && header === `Bearer ${secret}`;
  const user = cronOk ? null : await getSessionUser();
  const sessionOk = user?.role === "admin";
  if (secret) {
    if (!cronOk && !sessionOk) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  } else if (!sessionOk && header) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await processPendingJobs();
  return NextResponse.json(result);
}
