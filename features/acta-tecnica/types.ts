import { z } from "zod";
import type { BaseInspectionPayload } from "@/lib/types/inspection";
import { IDENTIFICACION } from "@/lib/identificacion";
import {
  codigoInspeccionSchema,
  emailSchema,
  establecimientoSchema,
  formatCodigoInspeccion,
  nitSchema,
  normalizeEmail,
  normalizeEstablecimiento,
  normalizeNit,
  normalizeUpperText,
  normalizeUpperTextOrDefault,
  upperTextBlank,
  upperTextOptional,
  upperTextRequired,
} from "@/lib/form-normalization";
import {
  CONDICIONES_SITIO,
  TIPO_INSPECCION_ACTIVA,
} from "@/features/acta-tecnica/constants";

const personaSchema = z.object({
  nombre: upperTextRequired("Nombre requerido"),
  cargo: upperTextRequired("Cargo requerido"),
  fecha: z.string().min(1, "Fecha requerida"),
  hora_inicial: z.string().min(1, "Hora inicial requerida"),
  hora_cierre: z.string().min(1, "Hora de cierre requerida"),
});

const condicionItemSchema = z.object({
  estado: z.enum(["conforme", "no_conforme"], {
    message: "Seleccione Conforme o No Conforme",
  }),
  observaciones: upperTextOptional,
});

const condicionesShape = Object.fromEntries(
  CONDICIONES_SITIO.map((c) => [c.key, condicionItemSchema]),
) as Record<(typeof CONDICIONES_SITIO)[number]["key"], typeof condicionItemSchema>;

const encuestaCalificacionSchema = z.union([
  z.enum(["excelente", "bueno", "regular", "deficiente"]),
  z.literal(""),
]);

const encuestaClaridadSchema = z.union([
  z.enum(["si", "parcialmente", "no"]),
  z.literal(""),
]);

export const actaTecnicaSchema = z
  .object({
    codigo: codigoInspeccionSchema(),
    razon_social: upperTextRequired(IDENTIFICACION.razon_social.requiredMessage),
    nit: nitSchema(),
    codigo_sicom: upperTextRequired(IDENTIFICACION.codigo_sicom.requiredMessage),
    establecimiento: establecimientoSchema(),
    direccion: upperTextRequired(IDENTIFICACION.direccion.requiredMessage),
    tipo_inspeccion: z.literal(TIPO_INSPECCION_ACTIVA, {
      message: "Seleccione IEDS (las demás opciones estarán disponibles pronto)",
    }),
    inspector_nombre: upperTextRequired("Nombre del inspector requerido"),
    inspector_celular: z.string().min(1, "Celular requerido"),
    inspector_correo: emailSchema(),
    personas: z.array(personaSchema).min(1, "Agregue al menos una persona"),
    condiciones: z.object(condicionesShape),
    permisos_requeridos: z.array(z.string()),
    epp: z.array(z.string()),
    riesgos_identificados: z.array(z.string()),
    riesgo_otro: upperTextBlank,
    actividades: upperTextOptional,
    equipos: upperTextOptional,
    medidas_preventivas: upperTextOptional,
    observaciones_adicionales: upperTextOptional,
    resultado: z.enum(["conforme", "no_conforme"], {
      message: "Seleccione el resultado",
    }),
    firma_cliente_nombre: upperTextRequired("Nombre del cliente requerido"),
    firma_cliente_cargo: upperTextRequired("Cargo del cliente requerido"),
    firma_cliente_fecha: z.string().min(1, "Fecha de firma requerida"),
    firma_cliente: z.string().min(1, "Firma del cliente requerida"),
    encuesta: z.object({
      conformidad_servicio: encuestaCalificacionSchema,
      claridad_procedimiento: encuestaClaridadSchema,
      calidad_atencion: encuestaCalificacionSchema,
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.riesgos_identificados.includes("otro") &&
      !data.riesgo_otro.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Indique el riesgo «Otro»",
        path: ["riesgo_otro"],
      });
    }
  });

export type ActaTecnicaFormValues = z.infer<typeof actaTecnicaSchema>;

export type ActaTecnicaData = ActaTecnicaFormValues;

export function createActaTecnicaDefaults(): ActaTecnicaFormValues {
  const today = new Date().toISOString().slice(0, 10);

  const condiciones = Object.fromEntries(
    CONDICIONES_SITIO.map((c) => [
      c.key,
      { estado: "conforme" as const, observaciones: "" },
    ]),
  ) as ActaTecnicaFormValues["condiciones"];

  return {
    codigo: "",
    razon_social: "",
    nit: "",
    codigo_sicom: "",
    establecimiento: "",
    direccion: "",
    tipo_inspeccion: TIPO_INSPECCION_ACTIVA,
    inspector_nombre: "",
    inspector_celular: "",
    inspector_correo: "",
    personas: [
      {
        nombre: "",
        cargo: "",
        fecha: today,
        hora_inicial: "",
        hora_cierre: "",
      },
    ],
    condiciones,
    permisos_requeridos: [],
    epp: [],
    riesgos_identificados: [],
    riesgo_otro: "",
    actividades: "",
    equipos: "",
    medidas_preventivas: "",
    observaciones_adicionales: "",
    resultado: "conforme",
    firma_cliente_nombre: "",
    firma_cliente_cargo: "",
    firma_cliente_fecha: today,
    firma_cliente: "",
    encuesta: {
      conformidad_servicio: "",
      claridad_procedimiento: "",
      calidad_atencion: "",
    },
  };
}

/** Normaliza campos de texto del acta (p. ej. tras getValues sin transforms de RHF). */
export function normalizeActaTecnicaValues(
  values: ActaTecnicaFormValues,
): ActaTecnicaFormValues {
  const condiciones = Object.fromEntries(
    Object.entries(values.condiciones).map(([key, item]) => [
      key,
      {
        ...item,
        observaciones: normalizeUpperTextOrDefault(item.observaciones),
      },
    ]),
  ) as ActaTecnicaFormValues["condiciones"];

  return {
    ...values,
    codigo: formatCodigoInspeccion(values.codigo),
    razon_social: normalizeUpperText(values.razon_social),
    nit: normalizeNit(values.nit),
    codigo_sicom: normalizeUpperText(values.codigo_sicom),
    establecimiento: normalizeEstablecimiento(values.establecimiento),
    direccion: normalizeUpperText(values.direccion),
    inspector_nombre: normalizeUpperText(values.inspector_nombre),
    inspector_celular: values.inspector_celular.trim(),
    inspector_correo: normalizeEmail(values.inspector_correo),
    personas: values.personas.map((persona) => ({
      ...persona,
      nombre: normalizeUpperText(persona.nombre),
      cargo: normalizeUpperText(persona.cargo),
    })),
    condiciones,
    riesgo_otro: normalizeUpperText(values.riesgo_otro),
    actividades: normalizeUpperTextOrDefault(values.actividades),
    equipos: normalizeUpperTextOrDefault(values.equipos),
    medidas_preventivas: normalizeUpperTextOrDefault(
      values.medidas_preventivas,
    ),
    observaciones_adicionales: normalizeUpperTextOrDefault(
      values.observaciones_adicionales,
    ),
    firma_cliente_nombre: normalizeUpperText(values.firma_cliente_nombre),
    firma_cliente_cargo: normalizeUpperText(values.firma_cliente_cargo),
  };
}

export function toActaTecnicaPayload(
  values: ActaTecnicaFormValues,
): BaseInspectionPayload<ActaTecnicaData> {
  const normalized = normalizeActaTecnicaValues(values);
  return {
    id_inspeccion: normalized.codigo,
    fecha: new Date().toISOString(),
    inspector: normalized.inspector_nombre,
    tipo_formulario: "acta-tecnica",
    data: normalized,
  };
}
