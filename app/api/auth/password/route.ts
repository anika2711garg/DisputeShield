import { NextResponse } from "next/server";
import { z } from "zod";
import { changeOwnPassword, requireSession } from "@/lib/auth/session";

const schema = z.object({
  current: z.string().min(1),
  next: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const user = await requireSession();
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    await changeOwnPassword(user.id, body.data.current, body.data.next);
    const response = NextResponse.json({ ok: true });
    response.cookies.set("ds_must_change", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed";
    if (message === "INVALID_CREDENTIALS") {
      return NextResponse.json({ error: "invalid_current" }, { status: 401 });
    }
    return NextResponse.json({ error: message.toLowerCase() }, { status: 400 });
  }
}
