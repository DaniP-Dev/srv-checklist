"use server";

import type {
  BaseInspectionPayload,
  SubmitResult,
} from "@/lib/types/inspection";
import { isUnifiedInspectionData } from "@/lib/types/inspection";

/**
 * Server Action unificada: POST del payload al webhook de Google Apps Script
 * (`GOOGLE_SHEETS_WEBHOOK_URL`).
 *
 * Contrato (checklist-campo / UnifiedInspectionData):
 * - Body = JSON completo del envelope (text/plain, compatible con doPost).
 * - `data.acta.data`, `data.checklist.data`, `data.evidencias_fotograficas[]`
 *   viajan estructurados; Apps Script los usa para Drive/Docs.
 * - El Sheet solo debe indexar metadatos + links (A–M). Nunca JSON/base64
 *   en celdas. Implementación de referencia:
 *   `docs/apps-script/RegistroInspecciones.gs`.
 * - Techo Vercel Server Actions ~4mb (`next.config.ts`); este action no
 *   recorta fotos — la compresión vive en el cliente.
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

  if (payload.tipo_formulario === "checklist-campo") {
    if (!isUnifiedInspectionData(payload.data)) {
      return {
        ok: false,
        error:
          "Payload checklist-campo incompleto: se requieren data.acta.data, data.checklist.data y data.evidencias_fotograficas[]",
      };
    }
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return { ok: false, error: "Falta GOOGLE_SHEETS_WEBHOOK_URL" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { ok: true };
    }

    return {
      ok: false,
      error: `Sheets webhook ${res.status}`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al enviar a Google Sheets";
    return { ok: false, error: message };
  }
}
