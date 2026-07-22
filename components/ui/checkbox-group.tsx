"use client";

interface CheckboxGroupProps {
  name: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

export function CheckboxGroup({
  name,
  options,
  values,
  onChange,
  error,
}: CheckboxGroupProps) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const inputId = `${name}-${opt.value}`;
          const checked = values.includes(opt.value);
          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={`inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-base transition-colors active:bg-primary/15 ${
                checked
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-background"
              }`}
            >
              <input
                id={inputId}
                type="checkbox"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => toggle(opt.value)}
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
