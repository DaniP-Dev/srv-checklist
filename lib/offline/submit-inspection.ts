import { submitToGoogleSheets } from "@/app/actions/submit-to-google-sheets";
import { clearDraft } from "@/lib/offline/drafts";
import { enqueue } from "@/lib/offline/outbox";
import type {
  BaseInspectionPayload,
  InspectionFormType,
} from "@/lib/types/inspection";

export type SubmitInspectionResult =
  | { ok: true; mode: "sent" }
  | { ok: true; mode: "queued" }
  | { ok: false; error: string };

function isNetworkLikeError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (error instanceof TypeError) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("network") ||
      msg.includes("fetch") ||
      msg.includes("failed to fetch") ||
      msg.includes("load failed")
    );
  }
  return false;
}

function isValidationError(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes("requerido") ||
    lower.includes("required") ||
    lower.includes("inválid") ||
    lower.includes("invalid")
  );
}

export async function submitInspection(
  payload: BaseInspectionPayload,
): Promise<SubmitInspectionResult> {
  const tipo = payload.tipo_formulario as InspectionFormType;

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueue(payload);
    await clearDraft(tipo);
    return { ok: true, mode: "queued" };
  }

  try {
    const result = await submitToGoogleSheets(payload);
    if (result.ok) {
      await clearDraft(tipo);
      return { ok: true, mode: "sent" };
    }

    if (isValidationError(result.error)) {
      return { ok: false, error: result.error };
    }

    await enqueue(payload);
    await clearDraft(tipo);
    return { ok: true, mode: "queued" };
  } catch (error) {
    if (isNetworkLikeError(error)) {
      await enqueue(payload);
      await clearDraft(tipo);
      return { ok: true, mode: "queued" };
    }
    const message =
      error instanceof Error ? error.message : "Error al enviar la inspección";
    return { ok: false, error: message };
  }
}
