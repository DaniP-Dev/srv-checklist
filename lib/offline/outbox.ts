import type { BaseInspectionPayload } from "@/lib/types/inspection";
import { getDb, type OutboxItem } from "@/lib/offline/db";

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function enqueue(
  payload: BaseInspectionPayload,
): Promise<OutboxItem> {
  const db = await getDb();
  const item: OutboxItem = {
    localId: createLocalId(),
    createdAt: new Date().toISOString(),
    status: "pending",
    attempts: 0,
    payload,
  };
  await db.put("outbox", item);
  notifyOutboxChanged();
  return item;
}

export async function listPending(): Promise<OutboxItem[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("outbox", "by-createdAt");
  return all.filter(
    (item) => item.status === "pending" || item.status === "failed",
  );
}

export async function listAll(): Promise<OutboxItem[]> {
  const db = await getDb();
  return db.getAllFromIndex("outbox", "by-createdAt");
}

export async function countPending(): Promise<number> {
  const pending = await listPending();
  return pending.length;
}

export async function markSyncing(localId: string): Promise<void> {
  const db = await getDb();
  const item = await db.get("outbox", localId);
  if (!item) return;
  item.status = "syncing";
  await db.put("outbox", item);
  notifyOutboxChanged();
}

export async function markSynced(localId: string): Promise<void> {
  const db = await getDb();
  await db.delete("outbox", localId);
  notifyOutboxChanged();
}

export async function markFailed(
  localId: string,
  error: string,
): Promise<void> {
  const db = await getDb();
  const item = await db.get("outbox", localId);
  if (!item) return;
  item.status = "failed";
  item.lastError = error;
  item.attempts += 1;
  await db.put("outbox", item);
  notifyOutboxChanged();
}

const OUTBOX_EVENT = "srv-outbox-changed";

export function notifyOutboxChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OUTBOX_EVENT));
}

export function subscribeOutboxChanged(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(OUTBOX_EVENT, listener);
  return () => window.removeEventListener(OUTBOX_EVENT, listener);
}
