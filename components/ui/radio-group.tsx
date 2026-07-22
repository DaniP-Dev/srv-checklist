"use client";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: ReadonlyArray<RadioOption>;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  orientation?: "horizontal" | "vertical";
  /** chips = pills sueltas; segmented = fila igual de botones (ideal C/NC/N/A) */
  variant?: "chips" | "segmented";
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
  orientation = "horizontal",
  variant = "chips",
}: RadioGroupProps) {
  if (variant === "segmented") {
    return (
      <div className="w-full">
        <div
          className="flex w-full gap-1 rounded-xl border border-border bg-background p-1"
          role="radiogroup"
          aria-label={name}
        >
          {options.map((opt) => {
            const inputId = `${name}-${opt.value}`;
            const selected = value === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={`relative flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-base font-semibold transition-colors active:scale-[0.98] ${
                  selected
                    ? "bg-primary text-white shadow-sm"
                    : "bg-transparent text-foreground hover:bg-card"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={selected}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
        {error ? (
          <p className="mt-1 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`flex gap-3 ${
          orientation === "horizontal" ? "flex-wrap" : "flex-col"
        }`}
        role="radiogroup"
        aria-label={name}
      >
        {options.map((opt) => {
          const inputId = `${name}-${opt.value}`;
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={`inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-base transition-colors active:bg-primary/15 ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-background"
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="shrink-0"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
