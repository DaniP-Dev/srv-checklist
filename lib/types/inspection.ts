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

/**
 * Una fila del documento "VERIFICACION FOTOGRAFICA DE LA ETAPA DE CAMPO".
 *
 * Apps Script: iterar `payload.data.evidencias_fotograficas` en orden;
 * cada elemento corresponde a la fila `codigo_ref` del Word
 * (ej. "4.1.1", "5.3.7"). Si un ítem tiene varias fotos, habrá varias
 * entradas con el mismo `codigo_ref`. `foto_base64` es el data URL
 * (`data:image/jpeg;base64,...`) o `null` cuando evaluación es NA /
 * no hay archivo.
 */
export type EvidenciaFotografica = {
  codigo_ref: string;
  item_nombre: string;
  evaluacion: "C" | "NC" | "NA";
  observacion: string;
  foto_base64: string | null;
};

/**
 * Payload maestro: acta + checklist + registro fotográfico bajo `data`.
 *
 * Estructura para Google Apps Script:
 * - `data.acta` → documento Acta
 * - `data.checklist` → documento Checklist de Campo
 * - `data.evidencias_fotograficas` → documento Registro Fotográfico
 *   (array plano ordenado 1:1 con códigos del Word)
 */
export type UnifiedInspectionData = {
  acta: BaseInspectionPayload;
  checklist: BaseInspectionPayload;
  evidencias_fotograficas: EvidenciaFotografica[];
};

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string };
