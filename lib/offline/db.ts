import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ActaTecnicaData } from "@/features/acta-tecnica/types";
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

export type TipoInspeccionSesion =
  | "IEDS"
  | "IEDS FLVL"
  | "PHT"
  | "PHL"
  /** Compatibilidad con sesiones IndexedDB antiguas. */
  | "EDS"
  | "Hermeticidad";

export interface InspectionSession {
  id: "current";
  codigo: string;
  tipoInspeccion: TipoInspeccionSesion;
  razon_social: string;
  nit: string;
  codigo_sicom: string;
  establecimiento: string;
  direccion: string;
  inspector_nombre: string;
  inspector_celular?: string;
  inspector_correo?: string;
  acta_completa?: BaseInspectionPayload<ActaTecnicaData>;
  updatedAt: string;
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
  "inspection-session": {
    key: string;
    value: InspectionSession;
  };
}

const DB_NAME = "srv-checklist";
const DB_VERSION = 2;

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
        if (!db.objectStoreNames.contains("inspection-session")) {
          db.createObjectStore("inspection-session", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}
