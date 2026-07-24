"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CHECKLIST_PLACEHOLDERS,
  INSPECTION_REGISTRY,
} from "@/lib/inspection-registry";
import { resetInspectionState } from "@/lib/offline/reset-inspection";
import {
  loadSession,
  type InspectionSession,
} from "@/lib/offline/session";

function edsLockReason(session: InspectionSession | null): string | null {
  if (!session) {
    return "Complete el acta de inspección y continúe al checklist para desbloquear.";
  }
  if (
    session.tipoInspeccion !== "IEDS" &&
    session.tipoInspeccion !== "EDS"
  ) {
    return `El acta actual es de ${session.tipoInspeccion}. El checklist IEDS no está disponible.`;
  }
  return null;
}

export function HomeInspectionCards() {
  const [session, setSession] = useState<InspectionSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const current = await loadSession();
      setSession(current);
    } catch {
      setSession(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const acta = INSPECTION_REGISTRY["acta-tecnica"];
  const checklistEds = INSPECTION_REGISTRY["checklist-campo"];
  const edsReason = edsLockReason(session);
  const edsUnlocked = loaded && edsReason === null;

  async function handleCancelSession() {
    setCancelling(true);
    try {
      await resetInspectionState();
      setSession(null);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-8">
      {loaded && session ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Inspección activa: {session.tipoInspeccion}
            </p>
            <p className="text-sm text-muted">
              {session.codigo} · {session.establecimiento || session.razon_social}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleCancelSession()}
            disabled={cancelling}
            className="min-h-12 rounded-lg px-3 text-sm font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
          >
            {cancelling ? "Cancelando…" : "Cancelar inspección"}
          </button>
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Paso 1 · Acta
        </h2>
        <Link
          href={`/inspeccion/${acta.slug}`}
          className="group flex min-h-40 flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary hover:bg-primary/5 active:border-primary active:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div>
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary group-active:text-primary">
              {acta.label}
            </h3>
            <p className="mt-2 text-base text-muted">{acta.description}</p>
          </div>
          <span className="mt-6 inline-flex min-h-12 items-center text-base font-semibold text-primary">
            {session ? "Continuar / editar acta →" : "Iniciar inspección →"}
          </span>
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Paso 2 · Checklist de campo
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {edsUnlocked ? (
            <Link
              href={`/inspeccion/${checklistEds.slug}`}
              className="group flex min-h-40 flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary hover:bg-primary/5 active:border-primary active:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary">
                  {checklistEds.label}
                </h3>
                <p className="mt-2 text-base text-muted">
                  {checklistEds.description}
                </p>
              </div>
              <span className="mt-6 inline-flex min-h-12 items-center text-base font-semibold text-primary">
                Abrir checklist →
              </span>
            </Link>
          ) : (
            <div
              aria-disabled="true"
              className="flex min-h-40 cursor-not-allowed flex-col justify-between rounded-xl border border-border bg-card/60 p-6 opacity-60"
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {checklistEds.label}
                </h3>
                <p className="mt-2 text-base text-muted">
                  {checklistEds.description}
                </p>
                <p className="mt-3 text-sm font-medium text-muted">
                  {loaded
                    ? edsReason
                    : "Verificando sesión de inspección…"}
                </p>
              </div>
              <span className="mt-6 inline-flex min-h-12 items-center text-base font-semibold text-muted">
                Bloqueado
              </span>
            </div>
          )}

          {CHECKLIST_PLACEHOLDERS.map((item) => (
            <div
              key={item.id}
              aria-disabled="true"
              className="flex min-h-40 cursor-not-allowed flex-col justify-between rounded-xl border border-dashed border-border bg-card/60 p-6 opacity-60"
            >
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {item.label}
                </h3>
                <p className="mt-2 text-base text-muted">{item.description}</p>
                {session?.tipoInspeccion === item.tipoInspeccion ? (
                  <p className="mt-3 text-sm font-medium text-muted">
                    Acta de {item.tipoInspeccion} asignada. Checklist aún no
                    disponible.
                  </p>
                ) : null}
              </div>
              <span className="mt-6 inline-flex min-h-12 items-center text-base font-semibold text-muted">
                Próximamente
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
