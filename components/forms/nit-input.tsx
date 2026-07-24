"use client";

import {
  joinNit,
  NIT_MAX_LENGTH,
  splitNit,
} from "@/lib/form-normalization";

interface NitInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

const fieldClass = (hasError: boolean) =>
  `min-h-12 rounded-lg border bg-card px-3.5 py-3 text-base text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 ${
    hasError ? "border-danger" : "border-border"
  }`;

export function NitInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: NitInputProps) {
  const { body, dv } = splitNit(value ?? "");
  const bodyMaxLength = NIT_MAX_LENGTH - (dv ? 2 : 0);
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="900123456"
          disabled={disabled}
          value={body}
          maxLength={bodyMaxLength}
          aria-invalid={hasError}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-w-0 flex-1 ${fieldClass(hasError)}`}
          onBlur={onBlur}
          onChange={(event) => {
            onChange(joinNit(event.target.value, dv));
          }}
        />
        <span
          className="shrink-0 select-none text-lg font-semibold text-muted"
          aria-hidden
        >
          -
        </span>
        <input
          id={id ? `${id}-dv` : undefined}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="×"
          disabled={disabled}
          value={dv}
          maxLength={1}
          aria-label="Dígito verificador del NIT"
          aria-invalid={hasError}
          className={`w-14 shrink-0 text-center ${fieldClass(hasError)}`}
          onBlur={onBlur}
          onChange={(event) => {
            onChange(joinNit(body, event.target.value));
          }}
        />
      </div>
      {error ? (
        <p id={id ? `${id}-error` : undefined} className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
