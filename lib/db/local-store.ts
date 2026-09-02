import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { buildDemoStore } from "@/lib/demo/seed-data";
import { HERO_DISPUTE_ID, USERS } from "@/lib/demo/constants";
import { DEFAULT_WORKSPACE_SETTINGS, type AppStore } from "@/types/domain";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let memory: AppStore | null = null;

function persist(store: AppStore): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store), "utf8");
}

export function getStore(): AppStore {
  if (memory) return hydrateStore(memory);
  if (existsSync(STORE_PATH)) {
    const parsed = JSON.parse(readFileSync(STORE_PATH, "utf8")) as AppStore;
    const missingSettings = !parsed.settings;
    memory = hydrateStore(parsed);
    if (missingSettings) persist(memory);
    return memory;
  }
  memory = buildDemoStore();
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
  return store;
}

export function saveStore(mutator: (store: AppStore) => void): AppStore {
  const store = getStore();
  mutator(store);
  persist(store);
  return store;
}

export function resetStore(): AppStore {
  memory = buildDemoStore();
  persist(memory);
  return memory;
}

export function replaceStore(next: AppStore): AppStore {
  memory = next;
  persist(memory);
  return memory;
}
