import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { buildDemoStore } from "@/lib/demo/seed-data";
import { HERO_DISPUTE_ID, USERS } from "@/lib/demo/constants";
import { hashPassword, isHashedPassword } from "@/lib/auth/password";
import { rebaseOpenDeadlines } from "@/lib/demo/rebase-deadlines";
import { DEFAULT_WORKSPACE_SETTINGS, type AppStore } from "@/types/domain";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let fallbackPath: string | null = null;
let memory: AppStore | null = null;
let memoryMtime = 0;

function activePath(): string {
  return process.env.DS_STORE_PATH || fallbackPath || STORE_PATH;
}

function fileMtime(file: string): number {
  try {
    return existsSync(file) ? statSync(file).mtimeMs : 0;
  } catch {
    return 0;
  }
}

function writeJson(file: string, store: AppStore): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(store), "utf8");
  try {
    renameSync(tmp, file);
  } catch {
    writeFileSync(file, JSON.stringify(store), "utf8");
    if (existsSync(tmp)) unlinkSync(tmp);
  }
}

function persist(store: AppStore): void {
  memory = store;
  try {
    writeJson(activePath(), store);
    memoryMtime = fileMtime(activePath());
  } catch {
    try {
      const fallback = path.join(tmpdir(), "disputeshield", "store.json");
      writeJson(/* turbopackIgnore: true */ fallback, store);
      fallbackPath = fallback;
      memoryMtime = Date.now();
    } catch {
      memoryMtime = Date.now();
    }
  }
}

function readJson(file: string): AppStore | null {
  try {
    if (!existsSync(file)) return null;
    return JSON.parse(readFileSync(file, "utf8")) as AppStore;
  } catch {
    return null;
  }
}

export function getStore(): AppStore {
  const file = activePath();
  const mtime = fileMtime(file);
  if (memory && mtime === memoryMtime) return memory;
  const parsed = readJson(file);
  if (parsed) {
    const hadPlain = (parsed.profiles ?? []).some((item) => item.password && !isHashedPassword(item.password));
    memory = hydrateStore(parsed);
    const shifted = rebaseOpenDeadlines(memory);
    memoryMtime = mtime;
    if (hadPlain || shifted) persist(memory);
    return memory;
  }
  memory = hydrateStore(buildDemoStore());
  persist(memory);
  return memory;
}

function hydrateStore(store: AppStore): AppStore {
  if (!store.settings) store.settings = { ...DEFAULT_WORKSPACE_SETTINGS };
  if (store.settings.contestThreshold == null) store.settings.contestThreshold = DEFAULT_WORKSPACE_SETTINGS.contestThreshold;
  if (store.settings.writeArmed == null) store.settings.writeArmed = false;
  if (store.settings.autoAssign == null) store.settings.autoAssign = false;
  const hero = store.disputes?.find((item) => item.id === HERO_DISPUTE_ID);
  if (hero && !hero.assigneeId) hero.assigneeId = USERS.admin.id;
  for (const profile of store.profiles ?? []) {
    if (profile.password && !isHashedPassword(profile.password)) {
      profile.password = hashPassword(profile.password);
    }
  }
  return store;
}

export function saveStore(mutator: (store: AppStore) => void): AppStore {
  const store = getStore();
  mutator(store);
  persist(store);
  return store;
}

export function resetStore(): AppStore {
  const next = hydrateStore(buildDemoStore());
  persist(next);
  return next;
}

export function replaceStore(next: AppStore): AppStore {
  persist(hydrateStore(next));
  return memory!;
}
