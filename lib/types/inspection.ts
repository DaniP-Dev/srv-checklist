export type InspectionFormType = "acta-tecnica" | "checklist-campo";

/**
 * Envelope unificado para todos los checklists.
 *
 * Contrato Apps Script / Drive (docs/apps-script/RegistroInspecciones.gs):
 * - El Sheet REGISTRO DE INSPECCIONES solo recibe metadatos livianos (cols A-M).
 * - Nunca persistir JSON completo ni base64 en celdas; Drive guarda Docs, fotos y payload.
 * - Limite Vercel Server Actions: ~4mb (next.config.ts bodySizeLimit).
 */
export interface BaseInspectionPayload<TData = Record<string, unknown>> {
  id_inspeccion: string;
  fecha: string;
  inspector: string;
  tipo_formulario: InspectionFormType;
  data: TData;
}

/**
 * Una fila del documento VERIFICACION FOTOGRAFICA DE LA ETAPA DE CAMPO.
 *
 * Apps Script: iterar payload.data.evidencias_fotograficas en orden;
 * cada elemento corresponde a la fila codigo_ref del Doc
 * (ej. 4.1.1, 5.3.7). Si un item tiene varias fotos, habra varias
 * entradas con el mismo codigo_ref. foto_base64 es el data URL
 * (data:image/jpeg;base64,...) o null cuando evaluacion es NA /
 * no hay archivo. GAS debe guardar cada imagen como archivo en Drive e
 * insertarla en el placeholder FOTO_X.X.X — no en el Sheet.
 */
export type EvidenciaFotografica = {
  codigo_ref: string;
  item_nombre: string;
  evaluacion: "C" | "NC" | "NA";
  observacion: string;
  foto_base64: string | null;
};

/**
 * Payload maestro enviado al webhook cuando tipo_formulario es checklist-campo.
 *
 * Rutas estables para Apps Script (sin tipar Acta/Checklist aqui para evitar
 * ciclos con features/acta-tecnica y features/checklist-campo):
 *
 * - data.acta.data: razon social, nit, resultado, firma_cliente, etc.
 * - data.checklist.data: establecimiento, etapa_dos, items, etc.
 * - data.evidencias_fotograficas: fotos (data URL) + codigo_ref
 *
 * Sheet indice (una fila):
 * A id, B fecha, C razon social, D establecimiento, E inspector,
 * F resultado acta, G etapa dos, H-L links Drive, M estado corto
 * (ej. OK Procesado en Drive).
 */
export type UnifiedInspectionData = {
  acta: BaseInspectionPayload;
  checklist: BaseInspectionPayload;
  evidencias_fotograficas: EvidenciaFotografica[];
};

/** Type guard: forma minima esperada por el webhook unificado. */
export function isUnifiedInspectionData(
  data: unknown,
): data is UnifiedInspectionData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const acta = d.acta as Record<string, unknown> | undefined;
  const checklist = d.checklist as Record<string, unknown> | undefined;
  return (
    !!acta &&
    typeof acta === "object" &&
    !!acta.data &&
    typeof acta.data === "object" &&
    !!checklist &&
    typeof checklist === "object" &&
    !!checklist.data &&
    typeof checklist.data === "object" &&
    Array.isArray(d.evidencias_fotograficas)
  );
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string };
