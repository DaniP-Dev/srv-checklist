import { z } from "zod";
import type {
  BaseInspectionPayload,
  EvidenciaFotografica,
} from "@/lib/types/inspection";
import { IDENTIFICACION } from "@/lib/identificacion";
import {
  CAMPO_INSPECTION_ITEMS,
  CONDICIONES_GENERALES,
} from "@/features/checklist-campo/constants";
import { REGISTRO_FOTOGRAFICO_ASPECTOS } from "@/features/checklist-campo/registro-fotografico";

export const MAX_ARCHIVOS_POR_ITEM = 3;
export const MAX_PDF_BYTES = 5 * 1024 * 1024;

const evaluationSchema = z.enum(["C", "NC", "NA"], {
  message: "Seleccione C, NC o N/A",
});

const condicionItemSchema = z.object({
  valor: z.enum(["si", "no"], { message: "Seleccione Sí o No" }),
  observaciones: z.string(),
});

const archivoAdjuntoSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  dataUrl: z.string(),
});

export const evidenciaSchema = z.object({
  notas: z.string(),
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

export const checklistCampoSchema = z
  .object({
    codigo: z.string().min(1, IDENTIFICACION.codigo.requiredMessage),
    fecha: z.string().min(1, "Fecha requerida"),
    inspector: z.string().min(1, "Inspector requerido"),
    razon_social: z
      .string()
      .min(1, IDENTIFICACION.razon_social.requiredMessage),
    nit: z.string().min(1, IDENTIFICACION.nit.requiredMessage),
    establecimiento: z
      .string()
      .min(1, IDENTIFICACION.establecimiento.requiredMessage),
    direccion: z.string().min(1, IDENTIFICACION.direccion.requiredMessage),
    condiciones_generales: z.object(condicionesShape),
    items: z.object(itemsShape),
    hallazgos: z.string(),
    etapa_dos: z.enum(["CUMPLE", "NO_CUMPLE"], {
      message: "Seleccione el resultado de Etapa dos",
    }),
    observaciones_tecnicas: z.string(),
  })
  .superRefine((data, ctx) => {
    for (const catalogItem of CAMPO_INSPECTION_ITEMS) {
      const item = data.items[catalogItem.key];
      if (item.evaluacion === "NA") continue;

      if (catalogItem.tipoEvidencia === "fotografica") {
        const hasImage = item.evidencia.archivos.some((archivo) =>
          archivo.mimeType.startsWith("image/"),
        );
        if (!hasImage) {
          ctx.addIssue({
            code: "custom",
            message: "Adjunte al menos una foto",
            path: ["items", catalogItem.key, "evidencia"],
          });
        }
      } else if (catalogItem.tipoEvidencia === "documental") {
        const hasFile = item.evidencia.archivos.length > 0;
        const hasNotas = item.evidencia.notas.trim().length > 0;
        if (!hasFile && !hasNotas) {
          ctx.addIssue({
            code: "custom",
            message: "Adjunte un documento o indique la referencia",
            path: ["items", catalogItem.key, "evidencia"],
          });
        }
      }
    }
  });

export type ChecklistCampoFormValues = z.infer<typeof checklistCampoSchema>;

export type ChecklistCampoData = ChecklistCampoFormValues;

export type EvidenciaValue = z.infer<typeof evidenciaSchema>;

export type ArchivoAdjunto = z.infer<typeof archivoAdjuntoSchema>;

export function createEmptyEvidencia(): EvidenciaValue {
  return { notas: "", archivos: [] };
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
  return {
    id_inspeccion: values.codigo,
    fecha: values.fecha
      ? new Date(values.fecha).toISOString()
      : new Date().toISOString(),
    inspector: values.inspector,
    tipo_formulario: "checklist-campo",
    data: values,
  };
}

/**
 * Construye el array plano del Registro Fotográfico en el orden del
 * documento oficial. Una entrada por archivo de imagen; si no hay
 * imágenes, una entrada con `foto_base64: null`.
 */
export function buildEvidenciasFotograficas(
  values: ChecklistCampoFormValues,
): EvidenciaFotografica[] {
  const result: EvidenciaFotografica[] = [];

  for (const aspecto of REGISTRO_FOTOGRAFICO_ASPECTOS) {
    const item = values.items[aspecto.itemKey];
    const imagenes = item.evidencia.archivos.filter((archivo) =>
      archivo.mimeType.startsWith("image/"),
    );

    if (imagenes.length === 0) {
      result.push({
        codigo_ref: aspecto.codigo,
        item_nombre: aspecto.aspecto,
        evaluacion: item.evaluacion,
        observacion: item.evidencia.notas,
        foto_base64: null,
      });
      continue;
    }

    for (const imagen of imagenes) {
      result.push({
        codigo_ref: aspecto.codigo,
        item_nombre: aspecto.aspecto,
        evaluacion: item.evaluacion,
        observacion: item.evidencia.notas,
        foto_base64: imagen.dataUrl,
      });
    }
  }

  return result;
}
