"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EVIDENCIA_PLACEHOLDERS,
  type EvidenciaTipo,
} from "@/features/checklist-campo/constants";
import {
  compressImageFile,
  readFileAsDataUrl,
} from "@/features/checklist-campo/compress-image";
import {
  MAX_ARCHIVOS_POR_ITEM,
  MAX_PDF_BYTES,
  type EvidenciaValue,
} from "@/features/checklist-campo/types";

interface EvidenciaFieldProps {
  id: string;
  tipo: EvidenciaTipo;
  value: EvidenciaValue;
  onChange: (value: EvidenciaValue) => void;
  error?: string;
}

export function EvidenciaField({
  id,
  tipo,
  value,
  onChange,
  error,
}: EvidenciaFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const displayError = localError ?? error;

  if (tipo === "directa") {
    return (
      <div>
        <Label htmlFor={id} className="md:sr-only">
          Observaciones
        </Label>
        <Textarea
          id={id}
          rows={3}
          placeholder={EVIDENCIA_PLACEHOLDERS.directa}
          value={value.notas}
          onChange={(event) =>
            onChange({ notas: event.target.value, archivos: [] })
          }
          error={displayError}
        />
      </div>
    );
  }

  const isFoto = tipo === "fotografica";
  const accept = isFoto ? "image/*" : "application/pdf,image/*";
  const buttonLabel = isFoto ? "Tomar / elegir foto" : "Adjuntar documento";
  const notesPlaceholder = isFoto
    ? EVIDENCIA_PLACEHOLDERS.fotografica
    : "Referencia / folio / bitácora…";

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const remaining = MAX_ARCHIVOS_POR_ITEM - value.archivos.length;
    if (remaining <= 0) {
      setLocalError(`Máximo ${MAX_ARCHIVOS_POR_ITEM} archivos`);
      return;
    }

    setBusy(true);
    setLocalError(undefined);

    try {
      const nextArchivos = [...value.archivos];
      const files = Array.from(fileList).slice(0, remaining);

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          nextArchivos.push(await compressImageFile(file));
          continue;
        }

        if (!isFoto && file.type === "application/pdf") {
          if (file.size > MAX_PDF_BYTES) {
            throw new Error("El PDF no puede superar 5 MB");
          }
          const dataUrl = await readFileAsDataUrl(file);
          nextArchivos.push({
            name: file.name,
            mimeType: file.type,
            dataUrl,
          });
          continue;
        }

        throw new Error(
          isFoto
            ? "Solo se permiten imágenes"
            : "Solo se permiten PDF o imágenes",
        );
      }

      onChange({ ...value, archivos: nextArchivos });
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "No se pudo adjuntar el archivo",
      );
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeArchivo(index: number) {
    onChange({
      ...value,
      archivos: value.archivos.filter((_, i) => i !== index),
    });
    setLocalError(undefined);
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        capture={isFoto ? "environment" : undefined}
        multiple
        className="sr-only"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={busy || value.archivos.length >= MAX_ARCHIVOS_POR_ITEM}
        onClick={() => fileInputRef.current?.click()}
      >
        {busy ? "Procesando…" : buttonLabel}
      </Button>

      {value.archivos.length > 0 ? (
        <ul className="space-y-2">
          {value.archivos.map((archivo, index) => (
            <li
              key={`${archivo.name}-${index}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-2"
            >
              {archivo.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={archivo.dataUrl}
                  alt={archivo.name}
                  className="h-14 w-14 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-card text-xs font-semibold text-muted">
                  PDF
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {archivo.name}
                </p>
                <button
                  type="button"
                  className="mt-1 text-sm text-danger hover:underline"
                  onClick={() => removeArchivo(index)}
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div>
        <Label htmlFor={id} className="md:sr-only">
          {isFoto ? "Notas de evidencia" : "Referencia documental"}
        </Label>
        <Textarea
          id={id}
          rows={2}
          placeholder={notesPlaceholder}
          value={value.notas}
          onChange={(event) =>
            onChange({ ...value, notas: event.target.value })
          }
          error={displayError}
        />
      </div>
    </div>
  );
}
