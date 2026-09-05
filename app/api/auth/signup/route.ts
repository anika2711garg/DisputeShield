import { NextResponse } from "next/server";
import { z } from "zod";
import { applySessionCookies, issueSessionToken } from "@/lib/auth/session";
import { createWorkspace } from "@/lib/services/team-service";
import { cloneDemoIntoOrganization } from "@/lib/demo/clone-into-org";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  workspaceName: z.string().min(2).max(80),
  loadDemo: z.boolean().optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const body = schema.safeParse(json);
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const profile = createWorkspace(body.data);
    if (body.data.loadDemo) {
      cloneDemoIntoOrganization(profile.organizationId, profile.id);
    }
    const token = await issueSessionToken(profile.id);
    const response = NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        organizationId: profile.organizationId,
      },
    });
    applySessionCookies(response, token);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }
}
