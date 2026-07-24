import type { InspectionFormType } from "@/lib/types/inspection";
import type { TipoInspeccion } from "@/features/acta-tecnica/constants";

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
    label: "Checklist IEDS",
    description:
      "Inspección detallada de instalaciones EDS con evaluación C / NC / N/A.",
  },
};

/** Placeholder de checklists futuros (sin ruta de formulario aún). */
export interface ChecklistPlaceholderMeta {
  id: string;
  label: string;
  description: string;
  tipoInspeccion: Exclude<TipoInspeccion, "IEDS">;
  comingSoon: true;
}

export const CHECKLIST_PLACEHOLDERS: ChecklistPlaceholderMeta[] = [
  {
    id: "checklist-ieds-flvl",
    label: "Checklist IEDS FLVL",
    description:
      "Checklist de campo para inspecciones IEDS FLVL. Próximamente.",
    tipoInspeccion: "IEDS FLVL",
    comingSoon: true,
  },
  {
    id: "checklist-pht",
    label: "Checklist PHT",
    description: "Checklist de campo para inspecciones PHT. Próximamente.",
    tipoInspeccion: "PHT",
    comingSoon: true,
  },
  {
    id: "checklist-phl",
    label: "Checklist PHL",
    description: "Checklist de campo para inspecciones PHL. Próximamente.",
    tipoInspeccion: "PHL",
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
