import type { CrossingLog } from "@/lib/types";

const KEY = "quay.crossings";

export function readActivity(): CrossingLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CrossingLog[]) : [];
  } catch {
    return [];
  }
}

export function writeActivity(rows: CrossingLog[]) {
  localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 40)));
}

export function pushActivity(row: CrossingLog) {
  const next = [row, ...readActivity().filter((r) => r.id !== row.id)];
  writeActivity(next);
  return next;
}

export function patchActivity(id: string, patch: Partial<CrossingLog>) {
  const next = readActivity().map((r) => (r.id === id ? { ...r, ...patch } : r));
  writeActivity(next);
  return next;
}
