import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const PREFIX = "scrypt";

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${PREFIX}$${salt}$${hash}`;
}

export function isHashedPassword(value?: string | null): boolean {
  return Boolean(value?.startsWith(`${PREFIX}$`));
}

export function verifyPassword(plain: string, stored?: string | null): boolean {
  if (!stored) return false;
  if (!isHashedPassword(stored)) return stored === plain;
  const parts = stored.split("$");
  const salt = parts[1];
  const hash = parts[2];
  if (!salt || !hash) return false;
  const next = scryptSync(plain, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}
