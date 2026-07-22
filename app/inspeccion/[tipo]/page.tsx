import { notFound } from "next/navigation";
import Link from "next/link";
import { ChecklistDispatcher } from "@/components/forms/checklist-dispatcher";
import {
  getInspectionMeta,
  isInspectionFormType,
} from "@/lib/inspection-registry";

interface PageProps {
  params: Promise<{ tipo: string }>;
}

export async function generateStaticParams() {
  return [{ tipo: "acta-tecnica" }, { tipo: "checklist-campo" }];
}

export async function generateMetadata({ params }: PageProps) {
  const { tipo } = await params;
  if (!isInspectionFormType(tipo)) {
    return { title: "Inspección no encontrada" };
  }
  const meta = getInspectionMeta(tipo);
  return {
    title: `${meta.label} | SRV Checklist`,
    description: meta.description,
  };
}

export default async function InspeccionTipoPage({ params }: PageProps) {
  const { tipo } = await params;

  if (!isInspectionFormType(tipo)) {
    notFound();
  }

  const meta = getInspectionMeta(tipo);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:px-8 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="mb-2 inline-flex min-h-12 items-center text-base font-medium text-primary active:opacity-70 hover:underline"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {meta.label}
          </h1>
          <p className="mt-1 max-w-2xl text-base text-muted">
            {meta.description}
          </p>
        </div>
      </div>

      <ChecklistDispatcher tipo={tipo} />
    </div>
  );
}
