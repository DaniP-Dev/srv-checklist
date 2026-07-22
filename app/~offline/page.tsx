import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        SRV Checklist
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        Sin conexión
      </h1>
      <p className="mt-3 text-base text-muted">
        No se pudo cargar esta página. Tus borradores y envíos pendientes
        siguen guardados en este dispositivo y se sincronizarán al recuperar la
        red.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-white hover:bg-primary-hover"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
