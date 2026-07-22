import { z } from "zod";
import type { BaseInspectionPayload } from "@/lib/types/inspection";
import { IDENTIFICACION } from "@/lib/identificacion";
import { CONDICIONES_SITIO } from "@/features/acta-tecnica/constants";

const personaSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  cargo: z.string().min(1, "Cargo requerido"),
  fecha: z.string().min(1, "Fecha requerida"),
  hora_inicial: z.string().min(1, "Hora inicial requerida"),
  hora_cierre: z.string().min(1, "Hora de cierre requerida"),
});

const condicionItemSchema = z.object({
  estado: z.enum(["conforme", "no_conforme"], {
    message: "Seleccione Conforme o No Conforme",
  }),
  observaciones: z.string(),
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
    codigo: z.string().min(1, IDENTIFICACION.codigo.requiredMessage),
    razon_social: z
      .string()
      .min(1, IDENTIFICACION.razon_social.requiredMessage),
    nit: z.string().min(1, IDENTIFICACION.nit.requiredMessage),
    codigo_sicom: z
      .string()
      .min(1, IDENTIFICACION.codigo_sicom.requiredMessage),
    establecimiento: z
      .string()
      .min(1, IDENTIFICACION.establecimiento.requiredMessage),
    direccion: z.string().min(1, IDENTIFICACION.direccion.requiredMessage),
    tipo_inspeccion: z.enum(["EDS", "Hermeticidad"], {
      message: "Seleccione el tipo de inspección",
    }),
    inspector_nombre: z.string().min(1, "Nombre del inspector requerido"),
    inspector_celular: z.string().min(1, "Celular requerido"),
    inspector_correo: z
      .string()
      .min(1, "Correo requerido")
      .email("Correo inválido"),
    personas: z.array(personaSchema).min(1, "Agregue al menos una persona"),
    condiciones: z.object(condicionesShape),
    permisos_requeridos: z.array(z.string()),
    epp: z.array(z.string()),
    riesgos_identificados: z.array(z.string()),
    riesgo_otro: z.string(),
    actividades: z.string(),
    equipos: z.string(),
    medidas_preventivas: z.string(),
    observaciones_adicionales: z.string(),
    resultado: z.enum(["conforme", "no_conforme"], {
      message: "Seleccione el resultado",
    }),
    firma_cliente_nombre: z.string().min(1, "Nombre del cliente requerido"),
    firma_cliente_cargo: z.string().min(1, "Cargo del cliente requerido"),
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
    tipo_inspeccion: "EDS",
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

export function toActaTecnicaPayload(
  values: ActaTecnicaFormValues,
): BaseInspectionPayload<ActaTecnicaData> {
  return {
    id_inspeccion: values.codigo,
    fecha: new Date().toISOString(),
    inspector: values.inspector_nombre,
    tipo_formulario: "acta-tecnica",
    data: values,
  };
}
