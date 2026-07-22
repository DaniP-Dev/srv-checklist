import { submitToGoogleSheets } from "@/app/actions/submit-to-google-sheets";
import {
  listPending,
  markFailed,
  markSynced,
  markSyncing,
} from "@/lib/offline/outbox";

export type SyncResult = {
  sent: number;
  failed: number;
  remaining: number;
};

let syncInFlight: Promise<SyncResult> | null = null;

export async function processOutbox(): Promise<SyncResult> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const pending = await listPending();
    return { sent: 0, failed: 0, remaining: pending.length };
  }

  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    let sent = 0;
    let failed = 0;
    const pending = await listPending();

    for (const item of pending) {
      await markSyncing(item.localId);
      try {
        const result = await submitToGoogleSheets(item.payload);
        if (result.ok) {
          await markSynced(item.localId);
          sent += 1;
        } else {
          await markFailed(item.localId, result.error);
          failed += 1;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error de sincronización";
        await markFailed(item.localId, message);
        failed += 1;
        // Si cae la red a mitad de camino, detener para reintentar después
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          break;
        }
      }
    }

    const remaining = (await listPending()).length;
    return { sent, failed, remaining };
  })();

  try {
    return await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}
