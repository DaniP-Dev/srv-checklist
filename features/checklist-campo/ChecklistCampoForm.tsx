"use client";

import { useRef, useState, useTransition } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitToGoogleSheets } from "@/app/actions/submit-to-google-sheets";
import {
  SignaturePad,
  type SignaturePadHandle,
} from "@/components/forms/signature-pad";
import { SubmitBar } from "@/components/forms/submit-bar";
import { Button } from "@/components/ui/button";
import { FormStatusBanner } from "@/components/ui/form-status-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { SectionCard } from "@/components/ui/section-card";
import { SwitchField } from "@/components/ui/switch-field";
import { Textarea } from "@/components/ui/textarea";
import {
  ALCANCE_INSPECCION,
  CAMPO_INSPECTION_ITEMS,
  CONDICIONES_GENERALES,
  ETAPA_DOS_OPTIONS,
  EVALUATION_OPTIONS,
  EVIDENCIA_TIPO_LABELS,
  type EvidenciaTipo,
} from "@/features/checklist-campo/constants";
import { EvidenciaField } from "@/features/checklist-campo/EvidenciaField";
import {
  checklistCampoSchema,
  createChecklistCampoDefaults,
  createEmptyEvidencia,
  toChecklistCampoPayload,
  type ChecklistCampoFormValues,
} from "@/features/checklist-campo/types";

function evidenciaTipoClassName(tipo: EvidenciaTipo) {
  if (tipo === "fotografica") {
    return "border-primary/30 bg-primary/10 text-primary";
  }
  if (tipo === "documental") {
    return "border-border bg-background text-muted";
  }
  return "border-border bg-background/80 text-muted";
}

function getEvidenciaError(
  errors: FieldErrors<ChecklistCampoFormValues>,
  key: (typeof CAMPO_INSPECTION_ITEMS)[number]["key"],
) {
  const evidenciaErrors = errors.items?.[key]?.evidencia;
  if (
    evidenciaErrors &&
    typeof evidenciaErrors === "object" &&
    "message" in evidenciaErrors &&
    typeof evidenciaErrors.message === "string"
  ) {
    return evidenciaErrors.message;
  }
  return undefined;
}

export function ChecklistCampoForm() {
  const firmaRef = useRef<SignaturePadHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ChecklistCampoFormValues>({
    resolver: zodResolver(checklistCampoSchema),
    defaultValues: createChecklistCampoDefaults(),
  });

  function onSubmit(values: ChecklistCampoFormValues) {
    const firma = firmaRef.current?.getDataURL() ?? "";
    if (!firma) {
      setStatus("error");
      setStatusMessage("La firma del inspector es obligatoria.");
      setValue("firma_inspector", "", { shouldValidate: true });
      return;
    }

    const payload = toChecklistCampoPayload({
      ...values,
      firma_inspector: firma,
    });

    setStatus("idle");
    startTransition(async () => {
      const result = await submitToGoogleSheets(payload);
      if (result.ok) {
        setStatus("success");
        setStatusMessage(
          "Checklist enviado correctamente (mock Google Sheets).",
        );
      } else {
        setStatus("error");
        setStatusMessage(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-submit-safe">
      <FormStatusBanner status={status} message={statusMessage} />

      <SectionCard title="Datos Generales">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="codigo" required>
              Código
            </Label>
            <Input
              id="codigo"
              error={errors.codigo?.message}
              {...register("codigo")}
            />
          </div>
          <div>
            <Label htmlFor="fecha" required>
              Fecha
            </Label>
            <Input
              id="fecha"
              type="date"
              error={errors.fecha?.message}
              {...register("fecha")}
            />
          </div>
          <div>
            <Label htmlFor="inspector" required>
              Inspector
            </Label>
            <Input
              id="inspector"
              error={errors.inspector?.message}
              {...register("inspector")}
            />
          </div>
          <div>
            <Label htmlFor="razon_social" required>
              Razón Social
            </Label>
            <Input
              id="razon_social"
              error={errors.razon_social?.message}
              {...register("razon_social")}
            />
          </div>
          <div>
            <Label htmlFor="nit" required>
              NIT
            </Label>
            <Input id="nit" error={errors.nit?.message} {...register("nit")} />
          </div>
          <div>
            <Label htmlFor="nombre_eds" required>
              Nombre de la EDS
            </Label>
            <Input
              id="nombre_eds"
              error={errors.nombre_eds?.message}
              {...register("nombre_eds")}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="ubicacion" required>
              Ubicación
            </Label>
            <Input
              id="ubicacion"
              error={errors.ubicacion?.message}
              {...register("ubicacion")}
            />
          </div>
          <div className="md:col-span-2 rounded-lg border border-border bg-background/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Alcance
            </p>
            <p className="mt-1 text-sm text-foreground">{ALCANCE_INSPECCION}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Condiciones Generales del Sitio">
        <div className="space-y-4">
          {CONDICIONES_GENERALES.map((item) => (
            <div
              key={item.key}
              className="grid gap-3 rounded-lg border border-border bg-background/50 p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center"
            >
              <div className="space-y-1">
                <Controller
                  control={control}
                  name={`condiciones_generales.${item.key}.valor`}
                  render={({ field }) => (
                    <SwitchField
                      id={`condicion-${item.key}`}
                      label={item.label}
                      checked={field.value === "si"}
                      onChange={(checked) =>
                        field.onChange(checked ? "si" : "no")
                      }
                      trueLabel="Sí"
                      falseLabel="No"
                    />
                  )}
                />
                <p className="text-xs text-muted">{item.criterio}</p>
              </div>
              <div>
                <Label htmlFor={`obs-${item.key}`}>Observaciones</Label>
                <Input
                  id={`obs-${item.key}`}
                  placeholder="Opcional"
                  {...register(
                    `condiciones_generales.${item.key}.observaciones`,
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Inspección en Campo"
        description="Evalúe cada ítem como C (Conforme), NC (No Conforme) o N/A. Capture la evidencia según el tipo indicado."
      >
        <div className="hidden border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(11rem,14rem)_minmax(0,1.4fr)] md:gap-4">
          <span>Ítem</span>
          <span>Evaluación</span>
          <span>Evidencia</span>
        </div>
        <div className="divide-y divide-border">
          {CAMPO_INSPECTION_ITEMS.map((item) => (
            <div
              key={item.key}
              className="grid gap-3 py-4 md:grid-cols-[minmax(0,1.3fr)_minmax(11rem,14rem)_minmax(0,1.4fr)] md:items-start md:gap-4"
            >
              <div className="space-y-1.5">
                <p className="text-base font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-sm text-muted">{item.criterio}</p>
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${evidenciaTipoClassName(item.tipoEvidencia)}`}
                >
                  {EVIDENCIA_TIPO_LABELS[item.tipoEvidencia]}
                </span>
                <p className="text-xs text-muted">{item.evidenciaRequerida}</p>
              </div>
              <Controller
                control={control}
                name={`items.${item.key}.evaluacion`}
                render={({ field }) => (
                  <RadioGroup
                    name={`item-${item.key}`}
                    variant="segmented"
                    options={[...EVALUATION_OPTIONS]}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.items?.[item.key]?.evaluacion?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name={`items.${item.key}.evidencia`}
                defaultValue={createEmptyEvidencia()}
                render={({ field }) => (
                  <EvidenciaField
                    id={`evidencia-${item.key}`}
                    tipo={item.tipoEvidencia}
                    value={field.value ?? createEmptyEvidencia()}
                    onChange={field.onChange}
                    error={getEvidenciaError(errors, item.key)}
                  />
                )}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Hallazgos y Conclusiones">
        <div className="space-y-5">
          <div>
            <Label htmlFor="hallazgos">Hallazgos</Label>
            <Textarea
              id="hallazgos"
              rows={4}
              {...register("hallazgos")}
            />
          </div>
          <div>
            <Label required>Etapa dos</Label>
            <Controller
              control={control}
              name="etapa_dos"
              render={({ field }) => (
                <RadioGroup
                  name="etapa_dos"
                  variant="segmented"
                  options={[...ETAPA_DOS_OPTIONS]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.etapa_dos?.message}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="observaciones_tecnicas">
              Observaciones técnicas
            </Label>
            <Textarea
              id="observaciones_tecnicas"
              rows={4}
              {...register("observaciones_tecnicas")}
            />
          </div>
          <div>
            <Controller
              control={control}
              name="firma_inspector"
              render={({ field }) => (
                <SignaturePad
                  ref={firmaRef}
                  label="Firma del inspector"
                  onChange={(dataUrl) => field.onChange(dataUrl ?? "")}
                />
              )}
            />
            {errors.firma_inspector?.message ? (
              <p className="mt-1 text-sm text-danger" role="alert">
                {errors.firma_inspector.message}
              </p>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SubmitBar>
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? "Enviando…" : "Enviar checklist"}
        </Button>
      </SubmitBar>
    </form>
  );
}
