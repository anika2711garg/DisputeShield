import { NextResponse } from "next/server";
import { z } from "zod";
import { applySessionCookies, createDemoSession, issueSessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const body = schema.safeParse(json);
  if (!body.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  try {
    const user = await createDemoSession(body.data.email, body.data.password);
    const token = await issueSessionToken(user.id);
    const response = NextResponse.json({ user });
    applySessionCookies(response, token, user.mustChangePassword);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "INVALID_CREDENTIALS";
    if (message === "INVALID_CREDENTIALS") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    return NextResponse.json({ error: "login_failed", detail: message }, { status: 500 });
  }
}
