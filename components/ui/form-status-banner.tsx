interface FormStatusBannerProps {
  status: "idle" | "success" | "error";
  message?: string;
}

export function FormStatusBanner({ status, message }: FormStatusBannerProps) {
  if (status === "idle") return null;

  const isSuccess = status === "success";

  return (
    <div
      role="status"
      className={`rounded-lg border px-4 py-3 text-base font-medium ${
        isSuccess
          ? "border-success/30 bg-success/10 text-success"
          : "border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      {message ??
        (isSuccess
          ? "Inspección enviada correctamente."
          : "No se pudo enviar la inspección.")}
    </div>
  );
}
