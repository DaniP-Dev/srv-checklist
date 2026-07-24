import { z } from "zod";
import { IDENTIFICACION } from "@/lib/identificacion";

const CODIGO_FULL_RE = /^SRV-INSP-(\d+)-(\d{4})$/i;
const NIT_RE = /^\d{8,}(-\d)?$/;

/** Trim + colapsar espacios múltiples a uno solo. */
export function collapseSpaces(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** Mensaje por defecto cuando un texto opcional queda vacío. */
export const TEXTO_PREDETERMINADO = "SIN OBSERVACIONES";

/** Texto libre en mayúsculas, sin espacios sobrantes. */
export function normalizeUpperText(value: string): string {
  return collapseSpaces(value).toUpperCase();
}

/** Mayúsculas; si queda vacío, usa el mensaje predeterminado. */
export function normalizeUpperTextOrDefault(
  value: string,
  fallback: string = TEXTO_PREDETERMINADO,
): string {
  return normalizeUpperText(value) || fallback;
}

/** Correo en minúsculas, sin espacios laterales. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** NIT sin espacios ni puntos de miles. */
export function normalizeNit(value: string): string {
  return value.replace(/[.\s]/g, "").trim();
}

/** Prefijos a eliminar antes de forzar `EDS [NOMBRE]`. */
const ESTABLECIMIENTO_PREFIX_RE =
  /^(ESTACI[OÓ]N\s+DE\s+SERVICIO|E\.?\s*S\.?|EDS)(\s+|$)/i;

/**
 * Establecimiento → `EDS [NOMBRE]` (idempotente).
 * Quita "estación de servicio", "E.S." o "EDS" redundantes.
 */
export function normalizeEstablecimiento(raw: string): string {
  let name = normalizeUpperText(raw);
  while (ESTABLECIMIENTO_PREFIX_RE.test(name)) {
    name = name.replace(ESTABLECIMIENTO_PREFIX_RE, "").trim();
  }
  if (!name) return "";
  return `EDS ${name}`;
}

/**
 * Consecutivo → `SRV-INSP-XXXX-AAAA` (idempotente).
 * Acepta "37", "0037" o un código ya formateado.
 */
export function formatCodigoInspeccion(raw: string): string {
  const trimmed = raw.trim();
  const fullMatch = trimmed.match(CODIGO_FULL_RE);
  if (fullMatch) {
    const consecutivo = fullMatch[1].padStart(4, "0");
    const year = fullMatch[2];
    return `SRV-INSP-${consecutivo}-${year}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) {
    return trimmed;
  }

  return `SRV-INSP-${digits.padStart(4, "0")}-${new Date().getFullYear()}`;
}

function hasCodigoDigits(value: string): boolean {
  const trimmed = value.trim();
  if (CODIGO_FULL_RE.test(trimmed)) return true;
  return /\d/.test(trimmed);
}

export function upperTextRequired(message: string) {
  return z.string().overwrite(normalizeUpperText).min(1, message);
}

/** Texto opcional: vacío → `SIN OBSERVACIONES`. */
export const upperTextOptional = z
  .string()
  .overwrite(normalizeUpperTextOrDefault);

/** Texto opcional que puede quedar vacío (p. ej. riesgo_otro condicional). */
export const upperTextBlank = z.string().overwrite(normalizeUpperText);

export function establecimientoSchema(
  requiredMessage = IDENTIFICACION.establecimiento.requiredMessage,
) {
  return z
    .string()
    .overwrite(normalizeEstablecimiento)
    .min(1, requiredMessage)
    .refine((value) => /^EDS\s+\S/.test(value), {
      message: "Indique el nombre de la EDS (ej. LA POPA)",
    });
}

export function emailSchema(requiredMessage = "Correo requerido") {
  return z
    .string()
    .overwrite(normalizeEmail)
    .min(1, requiredMessage)
    .email("Correo inválido");
}

export function nitSchema(requiredMessage = IDENTIFICACION.nit.requiredMessage) {
  return z
    .string()
    .overwrite(normalizeNit)
    .min(1, requiredMessage)
    .min(8, "NIT debe tener al menos 8 caracteres")
    .regex(NIT_RE, "NIT inválido");
}

export function codigoInspeccionSchema(
  requiredMessage = IDENTIFICACION.codigo.requiredMessage,
) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .refine(hasCodigoDigits, {
      message: "Ingrese el número consecutivo de la inspección",
    })
    .overwrite(formatCodigoInspeccion);
}
