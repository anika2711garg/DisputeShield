import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listNotifications, markNotificationRead } from "@/lib/services/notification-service";

export async function GET() {
  const user = await requireSession();
  return NextResponse.json({ items: listNotifications(user.organizationId) });
}

export async function POST(request: Request) {
  const user = await requireSession();
  const body = (await request.json()) as { id?: string };
  if (body.id) markNotificationRead(body.id, user.organizationId);
  return NextResponse.json({ ok: true });
}
