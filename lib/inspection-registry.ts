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
      "Registro formal de visita técnica con condiciones del sitio, ATS y firma del cliente.",
  },
  "checklist-campo": {
    slug: "checklist-campo",
    label: "Checklist de Inspección en Campo",
    description:
      "Inspección detallada de instalaciones EDS con evaluación C / NC / N/A.",
  },
};

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
