import type { InspectionFormType } from "@/lib/types/inspection";
import { getDb, type DraftRecord } from "@/lib/offline/db";

export async function saveDraft(
  tipo: InspectionFormType,
  values: unknown,
): Promise<void> {
  const db = await getDb();
  const record: DraftRecord = {
    tipo,
    updatedAt: new Date().toISOString(),
    values,
  };
  await db.put("drafts", record);
}

export async function loadDraft<T = unknown>(
  tipo: InspectionFormType,
): Promise<T | null> {
  const db = await getDb();
  const record = await db.get("drafts", tipo);
  return (record?.values as T | undefined) ?? null;
}

export async function clearDraft(tipo: InspectionFormType): Promise<void> {
  const db = await getDb();
  await db.delete("drafts", tipo);
}
