import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStore, saveStore } from "@/lib/db/local-store";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/types/domain";
import { hashPassword, isHashedPassword, verifyPassword } from "./password";
import { sessionSecret, signSessionId, verifySessionId } from "./session-token";

const COOKIE = "ds_session";
const MUST_CHANGE = "ds_must_change";

export type SessionUser = Pick<Profile, "id" | "organizationId" | "email" | "fullName" | "role"> & {
  mustChangePassword: boolean;
};

function toUser(profile: Profile): SessionUser {
  return {
    id: profile.id,
    organizationId: profile.organizationId,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    mustChangePassword: Boolean(profile.mustChangePassword),
  };
}

async function writeSessionCookie(userId: string, mustChangePassword = false): Promise<void> {
  const jar = await cookies();
  const token = await signSessionId(userId, sessionSecret());
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
  jar.set(COOKIE, token, base);
  if (mustChangePassword) jar.set(MUST_CHANGE, "1", base);
  else jar.delete(MUST_CHANGE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const userId = await verifySessionId(token, sessionSecret());
  if (!userId) return null;
  const profile = getStore().profiles.find((item) => item.id === userId);
  if (!profile) return null;
  return toUser(profile);
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (user) return user;
  const path = (await headers()).get("x-ds-path");
  if (path && !path.startsWith("/api/")) redirect("/login");
  throw new Error("UNAUTHENTICATED");
}

export async function createDemoSession(email: string, password: string): Promise<SessionUser> {
  const store = getStore();
  const profile = store.profiles.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!profile || !verifyPassword(password, profile.password)) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (profile.password && !isHashedPassword(profile.password)) {
    saveStore((next) => {
      const row = next.profiles.find((item) => item.id === profile.id);
      if (row) row.password = hashPassword(password);
    });
  }
  const fresh = getStore().profiles.find((item) => item.id === profile.id) ?? profile;
  await writeSessionCookie(fresh.id, Boolean(fresh.mustChangePassword));
  return toUser(fresh);
}

export async function changeOwnPassword(userId: string, current: string, nextPassword: string): Promise<void> {
  if (nextPassword.length < 8 || nextPassword.length > 72) throw new Error("WEAK_PASSWORD");
  const store = getStore();
  const profile = store.profiles.find((item) => item.id === userId);
  if (!profile || !verifyPassword(current, profile.password)) {
    throw new Error("INVALID_CREDENTIALS");
  }
  saveStore((next) => {
    const row = next.profiles.find((item) => item.id === userId);
    if (!row) return;
    row.password = hashPassword(nextPassword);
    row.mustChangePassword = false;
  });
  const jar = await cookies();
  jar.delete(MUST_CHANGE);
}

export async function createSignedSession(userId: string): Promise<void> {
  await writeSessionCookie(userId);
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete(MUST_CHANGE);
}

export function authMode(): "supabase" | "demo" {
  return isSupabaseConfigured() ? "supabase" : "demo";
}
