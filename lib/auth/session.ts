import "server-only";

import { cookies } from "next/headers";
import { getStore } from "@/lib/db/local-store";
import { getEnv, isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/types/domain";

const COOKIE = "ds_session";

export type SessionUser = Pick<Profile, "id" | "organizationId" | "email" | "fullName" | "role">;

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const store = getStore();
  const profile = store.profiles.find((item) => item.id === token);
  if (!profile) return null;
  return {
    id: profile.id,
    organizationId: profile.organizationId,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function createDemoSession(email: string, password: string): Promise<SessionUser> {
  const store = getStore();
  const profile = store.profiles.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!profile || profile.password !== password) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const jar = await cookies();
  jar.set(COOKIE, profile.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return {
    id: profile.id,
    organizationId: profile.organizationId,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
  };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function authMode(): "supabase" | "demo" {
  return isSupabaseConfigured() ? "supabase" : "demo";
}

export function demoSecret(): string {
  return getEnv().DEMO_AUTH_SECRET;
}
