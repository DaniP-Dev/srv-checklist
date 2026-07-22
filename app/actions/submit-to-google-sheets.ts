"use server";

import type {
  BaseInspectionPayload,
  SubmitResult,
} from "@/lib/types/inspection";

/**
 * Server Action unificada para enviar cualquier checklist a Google Sheets.
 *
 * Integración pendiente — descomentar y configurar cuando el webhook esté listo:
 *
 * 1. Google Apps Script (recomendado para prototipo):
 *    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
 *    if (!webhookUrl) return { ok: false, error: "Falta GOOGLE_SHEETS_WEBHOOK_URL" };
 *    const res = await fetch(webhookUrl, {
 *      method: "POST",
 *      headers: { "Content-Type": "application/json" },
 *      body: JSON.stringify(payload),
 *    });
 *    if (!res.ok) return { ok: false, error: `Sheets webhook ${res.status}` };
 *
 * 2. Google Sheets API con service account:
 *    - Usar googleapis + credentials JSON
 *    - Mapear payload.data a columnas por tipo_formulario
 *    - Append row en la hoja correspondiente
 */
export async function submitToGoogleSheets(
  payload: BaseInspectionPayload,
): Promise<SubmitResult> {
  if (!payload.id_inspeccion?.trim()) {
    return { ok: false, error: "id_inspeccion es requerido" };
  }
  if (!payload.tipo_formulario) {
    return { ok: false, error: "tipo_formulario es requerido" };
  }
  if (!payload.inspector?.trim()) {
    return { ok: false, error: "inspector es requerido" };
  }

  // Mock: loguea el payload hasta conectar el webhook / API real
  console.log(
    "[submitToGoogleSheets] mock OK",
    payload.tipo_formulario,
    payload.id_inspeccion,
    {
      fecha: payload.fecha,
      inspector: payload.inspector,
      dataKeys: Object.keys(payload.data ?? {}),
    },
  );

  return { ok: true };
}
