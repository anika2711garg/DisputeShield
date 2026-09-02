import "server-only";

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), ".data", "uploads");

export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "document";
}

export function writeEvidenceFile(relativePath: string, bytes: Buffer): string {
  const full = resolveEvidencePath(relativePath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, bytes);
  return relativePath;
}

export function readEvidenceFile(relativePath: string): Buffer | null {
  const full = resolveEvidencePath(relativePath);
  if (!existsSync(full)) return null;
  return readFileSync(full);
}

function resolveEvidencePath(relativePath: string): string {
  const cleaned = relativePath.replaceAll("\\", "/").replace(/^\/+/, "");
  if (cleaned.includes("..")) throw new Error("INVALID_PATH");
  const full = path.resolve(ROOT, cleaned);
  if (!full.startsWith(path.resolve(ROOT))) throw new Error("INVALID_PATH");
  return full;
}
