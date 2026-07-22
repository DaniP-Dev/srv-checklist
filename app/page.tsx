import Link from "next/link";
import { INSPECTION_REGISTRY } from "@/lib/inspection-registry";

export default function Home() {
  const checklists = Object.values(INSPECTION_REGISTRY);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 md:px-8 sm:py-14">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          SRV Checklist
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Formularios de inspección
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Seleccione el tipo de checklist para iniciar el registro en tablet.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {checklists.map((item) => (
          <Link
            key={item.slug}
            href={`/inspeccion/${item.slug}`}
            className="group flex min-h-40 flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary hover:bg-primary/5 active:border-primary active:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div>
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary group-active:text-primary">
                {item.label}
              </h2>
              <p className="mt-2 text-base text-muted">{item.description}</p>
            </div>
            <span className="mt-6 inline-flex min-h-12 items-center text-base font-semibold text-primary">
              Abrir formulario →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
