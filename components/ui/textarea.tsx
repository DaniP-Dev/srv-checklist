import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({
  className = "",
  error,
  id,
  rows = 3,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      <textarea
        id={id}
        rows={rows}
        className={`min-h-24 w-full rounded-lg border bg-card px-3.5 py-3 text-base text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
