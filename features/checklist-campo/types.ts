import { z } from "zod";
import type { BaseInspectionPayload } from "@/lib/types/inspection";
import { IDENTIFICACION } from "@/lib/identificacion";
import {
  codigoInspeccionSchema,
  establecimientoSchema,
  formatCodigoInspeccion,
  nitSchema,
  normalizeEstablecimiento,
  normalizeNit,
  normalizeUpperText,
  normalizeUpperTextOrDefault,
  upperTextOptional,
  upperTextRequired,
} from "@/lib/form-normalization";
import {
  CAMPO_INSPECTION_ITEMS,
  CONDICIONES_GENERALES,
} from "@/features/checklist-campo/constants";

export const MAX_ARCHIVOS_POR_ITEM = 3;

const evaluationSchema = z.enum(["C", "NC", "NA"], {
  message: "Seleccione C, NC o N/A",
});

const condicionItemSchema = z.object({
  valor: z.enum(["si", "no"], { message: "Seleccione Sí o No" }),
  observaciones: upperTextOptional,
});

const archivoAdjuntoSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  dataUrl: z.string(),
});

export const evidenciaSchema = z.object({
  notas: upperTextOptional,
  // Conservado por compatibilidad con borradores IndexedDB antiguos.
  archivos: z
    .array(archivoAdjuntoSchema)
    .max(MAX_ARCHIVOS_POR_ITEM, `Máximo ${MAX_ARCHIVOS_POR_ITEM} archivos`),
});

const campoItemSchema = z.object({
  evaluacion: evaluationSchema,
  evidencia: evidenciaSchema,
});

const condicionesShape = Object.fromEntries(
  CONDICIONES_GENERALES.map((c) => [c.key, condicionItemSchema]),
) as Record<
  (typeof CONDICIONES_GENERALES)[number]["key"],
  typeof condicionItemSchema
>;

const itemsShape = Object.fromEntries(
  CAMPO_INSPECTION_ITEMS.map((item) => [item.key, campoItemSchema]),
) as Record<
  (typeof CAMPO_INSPECTION_ITEMS)[number]["key"],
  typeof campoItemSchema
>;

export const checklistCampoSchema = z.object({
  codigo: codigoInspeccionSchema(),
  fecha: z.string().min(1, "Fecha requerida"),
  inspector: upperTextRequired("Inspector requerido"),
  razon_social: upperTextRequired(IDENTIFICACION.razon_social.requiredMessage),
  nit: nitSchema(),
  establecimiento: establecimientoSchema(),
  direccion: upperTextRequired(IDENTIFICACION.direccion.requiredMessage),
  condiciones_generales: z.object(condicionesShape),
  items: z.object(itemsShape),
  hallazgos: upperTextOptional,
  etapa_dos: z.enum(["CUMPLE", "NO_CUMPLE"], {
    message: "Seleccione el resultado de Etapa dos",
  }),
  observaciones_tecnicas: upperTextOptional,
});

export type ChecklistCampoFormValues = z.infer<typeof checklistCampoSchema>;

export type ChecklistCampoData = ChecklistCampoFormValues;

export type EvidenciaValue = z.infer<typeof evidenciaSchema>;

export type ArchivoAdjunto = z.infer<typeof archivoAdjuntoSchema>;

export function createEmptyEvidencia(): EvidenciaValue {
  return { notas: "", archivos: [] as ArchivoAdjunto[] };
}

export function createChecklistCampoDefaults(): ChecklistCampoFormValues {
  const condiciones_generales = Object.fromEntries(
    CONDICIONES_GENERALES.map((c) => [
      c.key,
      { valor: "si" as const, observaciones: "" },
    ]),
  ) as ChecklistCampoFormValues["condiciones_generales"];

  const items = Object.fromEntries(
    CAMPO_INSPECTION_ITEMS.map((item) => [
      item.key,
      { evaluacion: "C" as const, evidencia: createEmptyEvidencia() },
    ]),
  ) as ChecklistCampoFormValues["items"];

  return {
    codigo: "",
    fecha: new Date().toISOString().slice(0, 10),
    inspector: "",
    razon_social: "",
    nit: "",
    establecimiento: "",
    direccion: "",
    condiciones_generales,
    items,
    hallazgos: "",
    etapa_dos: "CUMPLE",
    observaciones_tecnicas: "",
  };
}

export function toChecklistCampoPayload(
  values: ChecklistCampoFormValues,
): BaseInspectionPayload<ChecklistCampoData> {
  // No enviar adjuntos Base64 (registro fotográfico es manual; borradores antiguos pueden tenerlos).
  const items = Object.fromEntries(
    Object.entries(values.items).map(([key, item]) => [
      key,
      {
        ...item,
        evidencia: {
          ...createEmptyEvidencia(),
          notas: normalizeUpperTextOrDefault(item.evidencia.notas),
        },
      },
    ]),
  ) as ChecklistCampoFormValues["items"];

  const condiciones_generales = Object.fromEntries(
    Object.entries(values.condiciones_generales).map(([key, item]) => [
      key,
      {
        ...item,
        observaciones: normalizeUpperTextOrDefault(item.observaciones),
      },
    ]),
  ) as ChecklistCampoFormValues["condiciones_generales"];

  const sanitized: ChecklistCampoFormValues = {
    ...values,
    codigo: formatCodigoInspeccion(values.codigo),
    inspector: normalizeUpperText(values.inspector),
    razon_social: normalizeUpperText(values.razon_social),
    nit: normalizeNit(values.nit),
    establecimiento: normalizeEstablecimiento(values.establecimiento),
    direccion: normalizeUpperText(values.direccion),
    condiciones_generales,
    hallazgos: normalizeUpperTextOrDefault(values.hallazgos),
    observaciones_tecnicas: normalizeUpperTextOrDefault(
      values.observaciones_tecnicas,
    ),
    items,
  };

  return {
    id_inspeccion: sanitized.codigo,
    fecha: sanitized.fecha
      ? new Date(sanitized.fecha).toISOString()
      : new Date().toISOString(),
    inspector: sanitized.inspector,
    tipo_formulario: "checklist-campo",
    data: sanitized,
  };
}
