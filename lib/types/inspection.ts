export type InspectionFormType = "acta-tecnica" | "checklist-campo";

/**
 * Envelope unificado para todos los checklists.
 * `data` contiene las respuestas específicas de cada formulario
 * y facilita el mapeo a columnas de Google Sheets.
 */
export interface BaseInspectionPayload<TData = Record<string, unknown>> {
  id_inspeccion: string;
  fecha: string;
  inspector: string;
  tipo_formulario: InspectionFormType;
  data: TData;
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string };
