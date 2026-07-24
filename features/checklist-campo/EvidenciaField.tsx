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
  buildPhotoFilename,
  compressImageToJpegBlob,
  downloadBlob,
} from "@/features/checklist-campo/local-photo";
import {
  createEmptyEvidencia,
  type EvidenciaValue,
} from "@/features/checklist-campo/types";

interface EvidenciaFieldProps {
  id: string;
  tipo: EvidenciaTipo;
  value: EvidenciaValue;
  onChange: (value: EvidenciaValue) => void;
  error?: string;
  /** Código de inspección para nombrar archivos locales. */
  fileNamePrefix?: string;
  /** Key del ítem del catálogo (nombre de archivo). */
  itemKey?: string;
}

function notesLabel(tipo: EvidenciaTipo) {
  if (tipo === "fotografica") return "Notas de evidencia";
  if (tipo === "documental") return "Notas opcionales";
  return "Observaciones";
}

function NotesTextarea({
  id,
  tipo,
  value,
  onChange,
  error,
}: {
  id: string;
  tipo: EvidenciaTipo;
  value: EvidenciaValue;
  onChange: (value: EvidenciaValue) => void;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="md:sr-only">
        {notesLabel(tipo)}
      </Label>
      <Textarea
        id={id}
        className="uppercase"
        rows={tipo === "directa" ? 3 : 2}
        placeholder={EVIDENCIA_PLACEHOLDERS[tipo]}
        value={value.notas}
        onChange={(event) =>
          onChange({
            ...createEmptyEvidencia(),
            notas: event.target.value,
          })
        }
        error={error}
      />
    </div>
  );
}

export function EvidenciaField({
  id,
  tipo,
  value,
  onChange,
  error,
  fileNamePrefix = "",
  itemKey = "item",
}: EvidenciaFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  if (tipo === "documental") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          El soporte documental lo entrega el cliente en físico o por fuera de
          la app. No se sube en este checklist.
        </p>
        <NotesTextarea
          id={id}
          tipo={tipo}
          value={value}
          onChange={onChange}
          error={error}
        />
      </div>
    );
  }

  if (tipo !== "fotografica") {
    return (
      <NotesTextarea
        id={id}
        tipo={tipo}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  }

  const displayError = localError ?? error;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setBusy(true);
    setLocalError(undefined);

    try {
      const file = Array.from(fileList).find((f) =>
        f.type.startsWith("image/"),
      );
      if (!file) {
        throw new Error("Solo se permiten imágenes");
      }

      const nextIndex = photoCount + 1;
      const blob = await compressImageToJpegBlob(file);
      const fileName = buildPhotoFilename(fileNamePrefix, itemKey, nextIndex);
      downloadBlob(blob, fileName);
      setPhotoCount(nextIndex);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "No se pudo procesar la foto",
      );
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
      >
        {busy
          ? "Guardando en el celular…"
          : photoCount === 0
            ? "Tomar foto"
            : "Tomar otra foto (otro ángulo)"}
      </Button>

      <p className="text-sm font-medium text-foreground">
        Fotos tomadas: {photoCount}
      </p>

      <p className="text-xs text-muted">
        Cada disparo se guarda solo en el celular. Las fotos no se envían con el
        checklist.
      </p>

      <NotesTextarea
        id={id}
        tipo={tipo}
        value={value}
        onChange={onChange}
        error={displayError}
      />
    </div>
  );
}
