"use client";

interface SwitchFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
}

export function SwitchField({
  id,
  label,
  checked,
  onChange,
  trueLabel = "Conforme",
  falseLabel = "No Conforme",
}: SwitchFieldProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-14 w-full items-center justify-between gap-4 rounded-lg border border-border bg-background/60 px-4 py-3 text-left transition-colors active:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="text-base font-medium text-foreground">{label}</span>
      <span
        className={`relative inline-flex h-10 w-24 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-success" : "bg-danger"
        }`}
        aria-hidden
      >
        <span
          className={`absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-14" : "translate-x-0"
          }`}
        />
        <span
          className={`w-full px-1.5 text-center text-xs font-semibold text-white ${
            checked ? "pr-8" : "pl-8"
          }`}
        >
          {checked ? trueLabel.slice(0, 3) : falseLabel.slice(0, 3)}
        </span>
      </span>
      <span className="sr-only">{checked ? trueLabel : falseLabel}</span>
    </button>
  );
}
