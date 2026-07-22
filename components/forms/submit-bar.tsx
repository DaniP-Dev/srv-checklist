import type { ReactNode } from "react";

interface SubmitBarProps {
  children: ReactNode;
}

/**
 * Barra fija inferior con safe-area para notch / home indicator.
 * En móvil el hijo suele ser un botón full-width; en md+ se alinea a la derecha.
 */
export function SubmitBar({ children }: SubmitBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 backdrop-blur"
      style={{
        paddingBottom: "calc(0.75rem + var(--safe-bottom))",
        paddingTop: "0.75rem",
      }}
    >
      <div className="mx-auto flex max-w-5xl justify-stretch md:justify-end">
        <div className="flex w-full flex-col-reverse gap-2 md:w-auto md:min-w-52 md:flex-row md:justify-end">
          {children}
        </div>
      </div>
    </div>
  );
}
