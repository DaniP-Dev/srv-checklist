import {
  getDb,
  type InspectionSession,
  type TipoInspeccionSesion,
} from "@/lib/offline/db";

export type { InspectionSession, TipoInspeccionSesion };

export type InspectionSessionInput = Omit<InspectionSession, "id" | "updatedAt">;

const SESSION_ID = "current" as const;

export async function saveSession(
  input: InspectionSessionInput,
): Promise<InspectionSession> {
  const db = await getDb();
  const record: InspectionSession = {
    ...input,
    id: SESSION_ID,
    updatedAt: new Date().toISOString(),
  };
  await db.put("inspection-session", record);
  return record;
}

export async function loadSession(): Promise<InspectionSession | null> {
  const db = await getDb();
  const record = await db.get("inspection-session", SESSION_ID);
  return record ?? null;
}

export async function clearSession(): Promise<void> {
  const db = await getDb();
  await db.delete("inspection-session", SESSION_ID);
}
