import { clearDraft } from "@/lib/offline/drafts";
import { clearSession } from "@/lib/offline/session";

/** Limpia sesión y borradores de acta/checklist. No toca el perfil del inspector. */
export async function resetInspectionState(): Promise<void> {
  await clearSession();
  await clearDraft("acta-tecnica");
  await clearDraft("checklist-campo");
}
