import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import { buildDemoStore } from "@/lib/demo/seed-data";
import { HERO_DISPUTE_ID, USERS } from "@/lib/demo/constants";
import { hashPassword, isHashedPassword } from "@/lib/auth/password";
import { rebaseOpenDeadlines } from "@/lib/demo/rebase-deadlines";
import { DEFAULT_WORKSPACE_SETTINGS, type AppStore } from "@/types/domain";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let memory: AppStore | null = null;
let memoryMtime = 0;

function fileMtime(): number {
  return existsSync(STORE_PATH) ? statSync(STORE_PATH).mtimeMs : 0;
}

function persist(store: AppStore): void {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${STORE_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(store), "utf8");
  try {
    renameSync(tmp, STORE_PATH);
  } catch {
    writeFileSync(STORE_PATH, JSON.stringify(store), "utf8");
    if (existsSync(tmp)) unlinkSync(tmp);
  }
  memory = store;
  memoryMtime = fileMtime();
}

export function getStore(): AppStore {
  const mtime = fileMtime();
  if (memory && mtime === memoryMtime) return memory;
  if (existsSync(STORE_PATH)) {
    const parsed = JSON.parse(readFileSync(STORE_PATH, "utf8")) as AppStore;
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
