import { NextResponse } from "next/server";
import { z } from "zod";
import { createDemoSession } from "@/lib/auth/session";

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
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
}
