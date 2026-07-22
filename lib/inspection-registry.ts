import type { InspectionFormType } from "@/lib/types/inspection";

export interface InspectionMeta {
  slug: InspectionFormType;
  label: string;
  description: string;
}

export const INSPECTION_REGISTRY: Record<InspectionFormType, InspectionMeta> = {
  "acta-tecnica": {
    slug: "acta-tecnica",
    label: "Acta de Inspección Técnica",
    description:
      "Paso 1: registro formal de visita con datos del sitio, ATS y firma. Requerido antes del checklist.",
  },
  "checklist-campo": {
    slug: "checklist-campo",
    label: "Checklist EDS",
    description:
      "Inspección detallada de instalaciones EDS con evaluación C / NC / N/A.",
  },
};

/** Placeholder de checklists futuros (sin ruta de formulario aún). */
export interface ChecklistPlaceholderMeta {
  id: string;
  label: string;
  description: string;
  tipoInspeccion: "Hermeticidad";
  comingSoon: true;
}

export const CHECKLIST_PLACEHOLDERS: ChecklistPlaceholderMeta[] = [
  {
    id: "checklist-hermeticidad",
    label: "Checklist Hermeticidad",
    description:
      "Checklist de campo para pruebas de hermeticidad. Próximamente.",
    tipoInspeccion: "Hermeticidad",
    comingSoon: true,
  },
];

export const INSPECTION_TYPES = Object.keys(
  INSPECTION_REGISTRY,
) as InspectionFormType[];

export function isInspectionFormType(
  value: string,
): value is InspectionFormType {
  return value in INSPECTION_REGISTRY;
}

export function getInspectionMeta(tipo: InspectionFormType): InspectionMeta {
  return INSPECTION_REGISTRY[tipo];
}
