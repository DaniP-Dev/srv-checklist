"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  countPending,
  subscribeOutboxChanged,
} from "@/lib/offline/outbox";
import { processOutbox, type SyncResult } from "@/lib/offline/sync";
import { useOnlineStatus } from "@/hooks/use-online-status";

type OutboxSyncContextValue = {
  online: boolean;
  pendingCount: number;
  syncing: boolean;
  lastResult: SyncResult | null;
  runSync: () => Promise<void>;
  refreshCount: () => Promise<void>;
};

const OutboxSyncContext = createContext<OutboxSyncContextValue | null>(null);

export function OutboxSyncProvider({ children }: { children: ReactNode }) {
  const online = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const lockRef = useRef(false);

  const refreshCount = useCallback(async () => {
    try {
      const count = await countPending();
      setPendingCount(count);
    } catch {
      // IndexedDB puede fallar en contextos restringidos
    }
  }, []);

  const runSync = useCallback(async () => {
    if (!navigator.onLine || lockRef.current) return;
    lockRef.current = true;
    setSyncing(true);
    try {
      const result = await processOutbox();
      setLastResult(result);
      setPendingCount(result.remaining);
    } finally {
      lockRef.current = false;
      setSyncing(false);
      await refreshCount();
    }
  }, [refreshCount]);

  useEffect(() => {
    void refreshCount();
    return subscribeOutboxChanged(() => {
      void refreshCount();
    });
  }, [refreshCount]);

  useEffect(() => {
    if (online) {
      void runSync();
    }
  }, [online, runSync]);

  const value = useMemo(
    () => ({
      online,
      pendingCount,
      syncing,
      lastResult,
      runSync,
      refreshCount,
    }),
    [online, pendingCount, syncing, lastResult, runSync, refreshCount],
  );

  return (
    <OutboxSyncContext.Provider value={value}>
      {children}
    </OutboxSyncContext.Provider>
  );
}

export function useOutboxSyncContext() {
  const ctx = useContext(OutboxSyncContext);
  if (!ctx) {
    throw new Error(
      "useOutboxSyncContext debe usarse dentro de OutboxSyncProvider",
    );
  }
  return ctx;
}
