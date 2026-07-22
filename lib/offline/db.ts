import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { BaseInspectionPayload, InspectionFormType } from "@/lib/types/inspection";

export type OutboxStatus = "pending" | "syncing" | "failed";

export interface OutboxItem {
  localId: string;
  createdAt: string;
  status: OutboxStatus;
  lastError?: string;
  attempts: number;
  payload: BaseInspectionPayload;
}

export interface DraftRecord {
  tipo: InspectionFormType;
  updatedAt: string;
  values: unknown;
}

interface SrvChecklistDB extends DBSchema {
  drafts: {
    key: InspectionFormType;
    value: DraftRecord;
  };
  outbox: {
    key: string;
    value: OutboxItem;
    indexes: { "by-createdAt": string; "by-status": OutboxStatus };
  };
}

const DB_NAME = "srv-checklist";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SrvChecklistDB>> | null = null;

export function getDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB solo está disponible en el cliente");
  }
  if (!dbPromise) {
    dbPromise = openDB<SrvChecklistDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "tipo" });
        }
        if (!db.objectStoreNames.contains("outbox")) {
          const outbox = db.createObjectStore("outbox", { keyPath: "localId" });
          outbox.createIndex("by-createdAt", "createdAt");
          outbox.createIndex("by-status", "status");
        }
      },
    });
  }
  return dbPromise;
}
