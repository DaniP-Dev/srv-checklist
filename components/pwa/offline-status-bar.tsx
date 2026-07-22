"use client";

import { useEffect, useState } from "react";
import { useOutboxSyncContext } from "@/components/pwa/outbox-sync-provider";

export function OfflineStatusBar() {
  const { online, pendingCount, syncing, lastResult } = useOutboxSyncContext();
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!lastResult) return;
    if (lastResult.sent > 0 && lastResult.failed === 0) {
      setFlash(
        lastResult.sent === 1
          ? "1 inspección sincronizada."
          : `${lastResult.sent} inspecciones sincronizadas.`,
      );
    } else if (lastResult.failed > 0) {
      setFlash(
        `No se pudieron sincronizar ${lastResult.failed} inspección(es). Se reintentará.`,
      );
    }
  }, [lastResult]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  if (online && pendingCount === 0 && !flash && !syncing) {
    return null;
  }

  let message = flash;
  if (!message) {
    if (!online) {
      message =
        pendingCount > 0
          ? `Sin conexión — ${pendingCount} pendiente(s) de envío`
          : "Sin conexión — trabajando en local";
    } else if (syncing) {
      message = "Sincronizando inspecciones pendientes…";
    } else if (pendingCount > 0) {
      message =
        pendingCount === 1
          ? "1 inspección pendiente de envío"
          : `${pendingCount} inspecciones pendientes de envío`;
    }
  }

  if (!message) return null;

  const tone = !online
    ? "border-amber-500/30 bg-amber-50 text-amber-950"
    : lastResult && lastResult.failed > 0 && flash
      ? "border-danger/30 bg-danger/10 text-danger"
      : "border-primary/30 bg-primary/10 text-primary";

  return (
    <div
      role="status"
      className={`sticky top-0 z-30 border-b px-4 py-2 text-center text-sm font-medium ${tone}`}
      style={{ paddingTop: "calc(0.5rem + var(--safe-top))" }}
    >
      {message}
    </div>
  );
}
