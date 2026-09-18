import { promises as fs } from "node:fs";
import path from "node:path";
import { buildSeed } from "@/lib/seed";
import type { LaunchpadStore } from "@/lib/types";

const g = globalThis as unknown as {
  __helixFunStore?: LaunchpadStore;
  __helixFunLock?: Promise<unknown>;
};

function dataDir() {
  if (process.env.VERCEL) return "/tmp";
  return process.env.LAUNCHPAD_DATA_DIR || path.join(process.cwd(), "data");
}

function dataFile() {
  return path.join(dataDir(), "launchpad.json");
}

async function readFileStore(): Promise<LaunchpadStore | null> {
  try {
    const raw = await fs.readFile(dataFile(), "utf8");
    const parsed = JSON.parse(raw) as LaunchpadStore;
    if (!parsed?.tokens?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeFileStore(store: LaunchpadStore) {
  try {
    const dir = dataDir();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(dataFile(), JSON.stringify(store));
  } catch {
    /* ephemeral environments (Vercel) stay in-memory */
  }
}

export async function loadStore(): Promise<LaunchpadStore> {
  if (g.__helixFunStore) return g.__helixFunStore;
  const fromDisk = await readFileStore();
  g.__helixFunStore = fromDisk ?? buildSeed();
  return g.__helixFunStore;
}

export async function withStore<T>(fn: (store: LaunchpadStore) => T | Promise<T>): Promise<T> {
  const prev = g.__helixFunLock ?? Promise.resolve();
  let release: () => void = () => {};
  g.__helixFunLock = new Promise<void>((res) => {
    release = res;
  });
  await prev.catch(() => {});
  try {
    const store = await loadStore();
    const result = await fn(store);
    g.__helixFunStore = store;
    await writeFileStore(store);
    return result;
  } finally {
    release();
  }
}

export async function resetStore() {
  g.__helixFunStore = buildSeed();
  await writeFileStore(g.__helixFunStore);
  return g.__helixFunStore;
}
