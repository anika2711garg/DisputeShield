import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { assertManageTeam } from "@/lib/auth/permissions";
import { USER_ROLES } from "@/types/domain";
import { inviteMember, listTeam, removeMember, resetMemberPassword, updateMemberRole } from "@/lib/services/team-service";

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(80),
  role: z.enum(USER_ROLES),
});

const patchSchema = z.object({
  memberId: z.string(),
  role: z.enum(USER_ROLES).optional(),
  resetPassword: z.boolean().optional(),
});

export async function GET() {
  const user = await requireSession();
  return NextResponse.json({ items: listTeam(user.organizationId) });
}

export async function POST(request: Request) {
  const user = await requireSession();
  assertManageTeam(user.role);
  const body = inviteSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const result = inviteMember({
      organizationId: user.organizationId,
      actorId: user.id,
      email: body.data.email,
      fullName: body.data.fullName,
      role: body.data.role,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed";
    return NextResponse.json({ error: message.toLowerCase() }, { status: message === "EMAIL_TAKEN" ? 409 : 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await requireSession();
  assertManageTeam(user.role);
  const body = patchSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    if (body.data.resetPassword) {
      const result = resetMemberPassword({
        organizationId: user.organizationId,
        actorId: user.id,
        memberId: body.data.memberId,
      });
      return NextResponse.json(result);
    }
    if (body.data.role) {
      updateMemberRole({
        organizationId: user.organizationId,
        actorId: user.id,
        memberId: body.data.memberId,
        role: body.data.role,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed";
    return NextResponse.json({ error: message.toLowerCase() }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await requireSession();
  assertManageTeam(user.role);
  const body = z.object({ memberId: z.string() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    removeMember({ organizationId: user.organizationId, actorId: user.id, memberId: body.data.memberId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed";
    return NextResponse.json({ error: message.toLowerCase() }, { status: 400 });
  }
}
