import type { LabelHTMLAttributes, ReactNode } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export function Label({
  children,
  required,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      className={`mb-1.5 block text-sm font-semibold text-foreground ${className}`}
      {...props}
    >
      {children}
      {required ? <span className="ml-0.5 text-danger">*</span> : null}
    </label>
  );
}
