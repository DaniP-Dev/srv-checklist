import { HomeInspectionCards } from "@/components/home/home-inspection-cards";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 md:px-8 sm:py-14">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          SRV Checklist
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Inspección técnica
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Primero complete el acta de inspección. El checklist de campo se
          desbloquea según el tipo seleccionado en el acta.
        </p>
      </header>

      <HomeInspectionCards />
    </div>
  );
}
