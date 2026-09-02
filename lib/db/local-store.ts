import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { buildDemoStore } from "@/lib/demo/seed-data";
import type { AppStore } from "@/types/domain";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let memory: AppStore | null = null;

function persist(store: AppStore): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store), "utf8");
}

export function getStore(): AppStore {
  if (memory) return memory;
  if (existsSync(STORE_PATH)) {
    memory = JSON.parse(readFileSync(STORE_PATH, "utf8")) as AppStore;
    return memory;
  }
  memory = buildDemoStore();
  persist(memory);
  return memory;
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
