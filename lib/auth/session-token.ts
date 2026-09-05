const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toHex(signature);
}

function timingEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

export async function signSessionId(userId: string, secret: string): Promise<string> {
  const signature = await hmacHex(secret, userId);
  return `${userId}.${signature}`;
}

export async function verifySessionId(token: string, secret: string): Promise<string | null> {
  const split = token.lastIndexOf(".");
  if (split <= 0) return null;
  const userId = token.slice(0, split);
  const signature = token.slice(split + 1);
  if (!userId || !signature) return null;
  const expected = await hmacHex(secret, userId);
  return timingEqual(signature, expected) ? userId : null;
}

export function sessionSecret(): string {
  return process.env.DEMO_AUTH_SECRET || "disputeshield-demo-secret";
}
