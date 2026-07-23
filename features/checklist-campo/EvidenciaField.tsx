"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EVIDENCIA_PLACEHOLDERS,
  type EvidenciaTipo,
} from "@/features/checklist-campo/constants";
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
}

function notesLabel(tipo: EvidenciaTipo) {
  if (tipo === "fotografica") return "Notas de evidencia";
  if (tipo === "documental") return "Referencia documental";
  return "Observaciones";
}

export function EvidenciaField({
  id,
  tipo,
  value,
  onChange,
  error,
}: EvidenciaFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="md:sr-only">
        {notesLabel(tipo)}
      </Label>
      <Textarea
        id={id}
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
