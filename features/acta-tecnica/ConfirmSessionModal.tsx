"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { InspectionSessionInput } from "@/lib/offline/session";

const COUNTDOWN_SECONDS = 10;

interface ConfirmSessionModalProps {
  open: boolean;
  data: InspectionSessionInput | null;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const REVIEW_FIELDS: {
  key: keyof InspectionSessionInput;
  label: string;
}[] = [
  { key: "codigo", label: "Código de inspección" },
  { key: "tipoInspeccion", label: "Tipo de inspección" },
  { key: "razon_social", label: "Razón Social" },
  { key: "nit", label: "NIT" },
  { key: "codigo_sicom", label: "Código SICOM" },
  { key: "establecimiento", label: "Establecimiento" },
  { key: "direccion", label: "Dirección" },
  { key: "inspector_nombre", label: "Inspector" },
];

export function ConfirmSessionModal({
  open,
  data,
  confirming = false,
  onCancel,
  onConfirm,
}: ConfirmSessionModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!open) return;

    setSecondsLeft(COUNTDOWN_SECONDS);
    const id = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [open]);

  if (!open || !data) return null;

  const canConfirm = secondsLeft === 0 && !confirming;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-session-title"
    >
      <div className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="border-b border-border px-5 py-4">
          <h2
            id="confirm-session-title"
            className="text-lg font-semibold text-foreground"
          >
            Verificar datos antes de continuar
          </h2>
          <p className="mt-1 text-sm text-muted">
            Revise la información en solo lectura. Si algo está mal, cancele y
            corríjala en el acta.
          </p>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <dl className="space-y-3">
            {REVIEW_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {label}
                </dt>
                <dd className="mt-0.5 text-base text-foreground">
                  {data[key]?.trim() || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={confirming}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="w-full sm:w-auto"
          >
            {confirming
              ? "Continuando…"
              : secondsLeft > 0
                ? `Espere ${secondsLeft} s…`
                : "Confirmar y continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
