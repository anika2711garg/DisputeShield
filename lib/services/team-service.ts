import "server-only";

import { createId } from "@/lib/db/ids";
import { getStore, saveStore } from "@/lib/db/local-store";
import { hashPassword } from "@/lib/auth/password";
import { slugify } from "@/lib/utils";
import type { Profile, UserRole } from "@/types/domain";
import { USER_ROLES } from "@/types/domain";
import { writeAudit } from "./audit-service";

function tempPassword(): string {
  return `Invite-${Math.random().toString(36).slice(2, 8)}`;
}

export function listTeam(organizationId: string): Omit<Profile, "password">[] {
  return getStore()
    .profiles.filter((item) => item.organizationId === organizationId)
    .map((item) => {
      const copy = { ...item };
      delete copy.password;
      return copy;
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function createWorkspace(input: {
  fullName: string;
  email: string;
  password: string;
  workspaceName: string;
}): Profile {
  const email = input.email.trim().toLowerCase();
  const store = getStore();
  if (store.profiles.some((item) => item.email.toLowerCase() === email)) {
    throw new Error("EMAIL_TAKEN");
  }
  const now = new Date().toISOString();
  const organizationId = createId("org");
  const profile: Profile = {
    id: createId("usr"),
    organizationId,
    email,
    fullName: input.fullName.trim(),
    role: "admin",
    createdAt: now,
    password: hashPassword(input.password),
  };
  saveStore((next) => {
    next.organizations.push({
      id: organizationId,
      name: input.workspaceName.trim(),
      slug: slugify(input.workspaceName) || organizationId,
      createdAt: now,
      updatedAt: now,
    });
    next.profiles.push(profile);
  });
  writeAudit({
    organizationId,
    actorType: "user",
    actorId: profile.id,
    action: "workspace.created",
    metadata: { email },
  });
  return profile;
}

export function inviteMember(input: {
  organizationId: string;
  actorId: string;
  email: string;
  fullName: string;
  role: UserRole;
}): { profile: Omit<Profile, "password">; temporaryPassword: string } {
  if (!USER_ROLES.includes(input.role)) throw new Error("INVALID_ROLE");
  const email = input.email.trim().toLowerCase();
  const store = getStore();
  if (store.profiles.some((item) => item.email.toLowerCase() === email)) {
    throw new Error("EMAIL_TAKEN");
  }
  const temporaryPassword = tempPassword();
  const now = new Date().toISOString();
  const profile: Profile = {
    id: createId("usr"),
    organizationId: input.organizationId,
    email,
    fullName: input.fullName.trim(),
    role: input.role,
    createdAt: now,
    password: hashPassword(temporaryPassword),
    mustChangePassword: true,
  };
  saveStore((next) => {
    next.profiles.push(profile);
  });
  writeAudit({
    organizationId: input.organizationId,
    actorType: "user",
    actorId: input.actorId,
    action: "team.invited",
    metadata: { email, role: input.role },
  });
  const safe = { ...profile };
  delete safe.password;
  return { profile: safe, temporaryPassword };
}

export function updateMemberRole(input: {
  organizationId: string;
  actorId: string;
  memberId: string;
  role: UserRole;
}): void {
  if (!USER_ROLES.includes(input.role)) throw new Error("INVALID_ROLE");
  if (input.memberId === input.actorId) throw new Error("CANNOT_CHANGE_SELF");
  saveStore((store) => {
    const member = store.profiles.find((item) => item.id === input.memberId && item.organizationId === input.organizationId);
    if (!member) throw new Error("NOT_FOUND");
    member.role = input.role;
  });
  writeAudit({
    organizationId: input.organizationId,
    actorType: "user",
    actorId: input.actorId,
    action: "team.role_changed",
    metadata: { memberId: input.memberId, role: input.role },
  });
}

export function removeMember(input: { organizationId: string; actorId: string; memberId: string }): void {
  if (input.memberId === input.actorId) throw new Error("CANNOT_REMOVE_SELF");
  saveStore((store) => {
    const index = store.profiles.findIndex((item) => item.id === input.memberId && item.organizationId === input.organizationId);
    if (index < 0) throw new Error("NOT_FOUND");
    store.profiles.splice(index, 1);
  });
  writeAudit({
    organizationId: input.organizationId,
    actorType: "user",
    actorId: input.actorId,
    action: "team.removed",
    metadata: { memberId: input.memberId },
  });
}

export function resetMemberPassword(input: {
  organizationId: string;
  actorId: string;
  memberId: string;
}): { temporaryPassword: string } {
  const temporaryPassword = tempPassword();
  saveStore((store) => {
    const member = store.profiles.find((item) => item.id === input.memberId && item.organizationId === input.organizationId);
    if (!member) throw new Error("NOT_FOUND");
    member.password = hashPassword(temporaryPassword);
    member.mustChangePassword = true;
  });
  writeAudit({
    organizationId: input.organizationId,
    actorType: "user",
    actorId: input.actorId,
    action: "team.password_reset",
    metadata: { memberId: input.memberId },
  });
  return { temporaryPassword };
}
