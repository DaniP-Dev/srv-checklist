export const TIPO_INSPECCION_OPTIONS = [
  { value: "EDS", label: "EDS" },
  { value: "Hermeticidad", label: "Hermeticidad" },
] as const;

export const CONDICIONES_SITIO = [
  {
    key: "acceso_seguro",
    label: "Acceso seguro y libre de obstáculos",
  },
  {
    key: "condiciones_climaticas",
    label: "Condiciones climáticas aptas",
  },
  {
    key: "sitio_limpio",
    label: "Sitio limpio y libre de riesgos",
  },
  {
    key: "iluminacion",
    label: "Iluminación adecuada",
  },
  {
    key: "presencia_responsable",
    label: "Presencia del responsable del sitio",
  },
] as const;

export const CONDICION_ESTADO_OPTIONS = [
  { value: "conforme", label: "Conforme" },
  { value: "no_conforme", label: "No Conforme" },
] as const;

export const PERMISOS_REQUERIDOS = [
  { value: "trabajo_altura", label: "Trabajo en alturas" },
  { value: "espacio_confinado", label: "Espacios confinados" },
] as const;

export const EPP_OPTIONS = [
  { value: "botas", label: "Botas" },
  { value: "guantes", label: "Guantes" },
  { value: "casco", label: "Casco" },
  { value: "lentes", label: "Lentes" },
  { value: "chaleco", label: "Chaleco reflectivo" },
] as const;

export const RIESGOS_IDENTIFICADOS = [
  { value: "ambiental", label: "Ambiental" },
  { value: "mecanico", label: "Mecánico" },
  { value: "electrico", label: "Eléctrico" },
  { value: "fisico", label: "Físico" },
  { value: "quimico", label: "Químico" },
  { value: "biologico", label: "Biológico" },
  { value: "otro", label: "Otro" },
] as const;

export const RESULTADO_OPTIONS = [
  { value: "conforme", label: "Conforme" },
  { value: "no_conforme", label: "No Conforme" },
] as const;

export const PQRS_TEXTO =
  "En caso que el cliente tenga algún PQRS, por favor puede enviarlo al siguiente correo electrónico: servicrep04@gmail.com o por medio del número telefónico 3152077289";

export const ENCUESTA_CALIFICACION_OPTIONS = [
  { value: "excelente", label: "Excelente" },
  { value: "bueno", label: "Bueno" },
  { value: "regular", label: "Regular" },
  { value: "deficiente", label: "Deficiente" },
] as const;

export const ENCUESTA_CLARIDAD_OPTIONS = [
  { value: "si", label: "Sí" },
  { value: "parcialmente", label: "Parcialmente" },
  { value: "no", label: "No" },
] as const;

export const ENCUESTA_PREGUNTAS = [
  {
    key: "conformidad_servicio",
    label:
      "¿Cómo califica la conformidad del servicio de inspección recibido?",
    options: ENCUESTA_CALIFICACION_OPTIONS,
  },
  {
    key: "claridad_procedimiento",
    label:
      "¿La explicación del procedimiento y los resultados fue clara y comprensible?",
    options: ENCUESTA_CLARIDAD_OPTIONS,
  },
  {
    key: "calidad_atencion",
    label:
      "¿Cómo evalúa la calidad y claridad de la atención brindada por el inspector?",
    options: ENCUESTA_CALIFICACION_OPTIONS,
  },
] as const;
