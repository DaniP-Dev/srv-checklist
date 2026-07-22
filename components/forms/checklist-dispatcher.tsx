"use client";

import type { ComponentType } from "react";
import type { InspectionFormType } from "@/lib/types/inspection";
import { ActaInspeccionTecnicaForm } from "@/features/acta-tecnica/ActaInspeccionTecnicaForm";
import { ChecklistCampoForm } from "@/features/checklist-campo/ChecklistCampoForm";

const FORM_COMPONENTS: Record<InspectionFormType, ComponentType> = {
  "acta-tecnica": ActaInspeccionTecnicaForm,
  "checklist-campo": ChecklistCampoForm,
};

interface ChecklistDispatcherProps {
  tipo: InspectionFormType;
}

/**
 * Renderiza el formulario correspondiente al slug de inspección.
 * Para agregar un checklist nuevo: registrar el componente aquí
 * y en `lib/inspection-registry.ts`.
 */
export function ChecklistDispatcher({ tipo }: ChecklistDispatcherProps) {
  const Form = FORM_COMPONENTS[tipo];
  return <Form />;
}
