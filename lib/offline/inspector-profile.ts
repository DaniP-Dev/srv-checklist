const STORAGE_KEY = "srv-checklist:inspector-profile";

export interface InspectorProfile {
  inspector_nombre: string;
  inspector_celular: string;
  inspector_correo: string;
}

export function loadInspectorProfile(): InspectorProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<InspectorProfile>;
    return {
      inspector_nombre: String(parsed.inspector_nombre ?? ""),
      inspector_celular: String(parsed.inspector_celular ?? ""),
      inspector_correo: String(parsed.inspector_correo ?? ""),
    };
  } catch {
    return null;
  }
}

export function saveInspectorProfile(profile: InspectorProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        inspector_nombre: profile.inspector_nombre.trim(),
        inspector_celular: profile.inspector_celular.trim(),
        inspector_correo: profile.inspector_correo.trim().toLowerCase(),
      }),
    );
  } catch {
    // ignore quota / private mode
  }
}
