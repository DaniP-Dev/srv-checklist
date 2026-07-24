"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitBar } from "@/components/forms/submit-bar";
import { Button } from "@/components/ui/button";
import { FormStatusBanner } from "@/components/ui/form-status-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { SectionCard } from "@/components/ui/section-card";
import { SwitchField } from "@/components/ui/switch-field";
import { Textarea } from "@/components/ui/textarea";
import { useFormDraft } from "@/hooks/use-form-draft";
import { useOutboxSync } from "@/hooks/use-outbox-sync";
import { IDENTIFICACION } from "@/lib/identificacion";
import { submitInspection } from "@/lib/offline/submit-inspection";
import { resetInspectionState } from "@/lib/offline/reset-inspection";
import {
  loadSession,
  type InspectionSession,
} from "@/lib/offline/session";
import type {
  BaseInspectionPayload,
  UnifiedInspectionData,
} from "@/lib/types/inspection";
import {
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
import { TEXTO_PREDETERMINADO } from "@/lib/form-normalization";

const SESSION_LOCKED_CLASS =
  "bg-background/80 text-muted read-only:cursor-default";

const REGISTRO_FOTOGRAFICO_ALERT =
  "⚠️ ATENCIÓN: En cada ítem fotográfico usa “Tomar foto” / “Tomar otra foto”. Cada disparo se guarda solo en el celular. Las fotos no viajan con el checklist; el registro fotográfico se elaborará manualmente en la oficina.";

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

function applySessionFields(
  setValue: ReturnType<
    typeof useForm<ChecklistCampoFormValues>
  >["setValue"],
  session: InspectionSession,
) {
  setValue("codigo", session.codigo);
  setValue("inspector", session.inspector_nombre);
  setValue("razon_social", session.razon_social);
  setValue("nit", session.nit);
  setValue("establecimiento", session.establecimiento);
  setValue("direccion", session.direccion);
}

export function ChecklistCampoForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [sessionReady, setSessionReady] = useState(false);
  const sessionRef = useRef<InspectionSession | null>(null);
  const { refreshCount } = useOutboxSync();

  const form = useForm<ChecklistCampoFormValues>({
    resolver: zodResolver(checklistCampoSchema),
    defaultValues: createChecklistCampoDefaults(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const inspeccionCodigo = watch("codigo");

  const onDraftLoaded = useCallback((values: ChecklistCampoFormValues) => {
    const session = sessionRef.current;
    if (!session) return;
    // Conservar respuestas del borrador, forzar identificación desde la sesión.
    reset({
      ...values,
      codigo: session.codigo,
      inspector: session.inspector_nombre,
      razon_social: session.razon_social,
      nit: session.nit,
      establecimiento: session.establecimiento,
      direccion: session.direccion,
    });
  }, [reset]);

  const { clearCurrentDraft } = useFormDraft("checklist-campo", form, {
    enabled: sessionReady,
    onDraftLoaded,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const session = await loadSession();
        if (cancelled) return;

        if (
          !session ||
          (session.tipoInspeccion !== "IEDS" &&
            session.tipoInspeccion !== "EDS")
        ) {
          router.replace("/");
          return;
        }

        sessionRef.current = session;
        applySessionFields(setValue, session);
        setSessionReady(true);
      } catch {
        if (!cancelled) router.replace("/");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, setValue]);

  function onSubmit(values: ChecklistCampoFormValues) {
    const session = sessionRef.current;
    const lockedValues: ChecklistCampoFormValues = session
      ? {
          ...values,
          codigo: session.codigo,
          inspector: session.inspector_nombre,
          razon_social: session.razon_social,
          nit: session.nit,
          establecimiento: session.establecimiento,
          direccion: session.direccion,
        }
      : values;

    const checklistPayload = toChecklistCampoPayload(lockedValues);

    if (!session?.acta_completa) {
      setStatus("error");
      setStatusMessage(
        "No se encontró el acta de inspección en la sesión. Vuelva a completar el acta.",
      );
      return;
    }

    // Contrato webhook: data.acta.data / data.checklist.data /
    // data.evidencias_fotograficas[] (vacío: registro fotográfico manual).
    const payload: BaseInspectionPayload<UnifiedInspectionData> = {
      id_inspeccion: checklistPayload.id_inspeccion,
      fecha: checklistPayload.fecha,
      inspector: checklistPayload.inspector,
      tipo_formulario: "checklist-campo",
      data: {
        acta: session.acta_completa,
        checklist: checklistPayload,
        evidencias_fotograficas: [],
      },
    };

    setStatus("idle");
    startTransition(async () => {
      const result = await submitInspection(payload);
      if (!result.ok) {
        setStatus("error");
        setStatusMessage(result.error);
        return;
      }

      setStatus("success");
      if (result.mode === "queued") {
        setStatusMessage(
          "Guardado sin conexión. Se enviará al recuperar la red.",
        );
        void refreshCount();
      } else {
        setStatusMessage("Checklist enviado correctamente.");
      }

      await resetInspectionState();
      sessionRef.current = null;
      void clearCurrentDraft();
      reset(createChecklistCampoDefaults());
      router.push("/");
    });
  }

  if (!sessionReady) {
    return (
      <p className="text-base text-muted">
        Verificando acta de inspección asignada…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-submit-safe">
      <FormStatusBanner status={status} message={statusMessage} />

      <SectionCard
        title="Datos Generales"
        description="Datos traídos del acta de inspección (solo lectura)."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={IDENTIFICACION.codigo.key} required>
              {IDENTIFICACION.codigo.label}
            </Label>
            <Input
              id={IDENTIFICACION.codigo.key}
              error={errors.codigo?.message}
              readOnly
              className={`${SESSION_LOCKED_CLASS} uppercase`}
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
              readOnly
              className={`${SESSION_LOCKED_CLASS} uppercase`}
              {...register("inspector")}
            />
          </div>
          <div>
            <Label htmlFor={IDENTIFICACION.razon_social.key} required>
              {IDENTIFICACION.razon_social.label}
            </Label>
            <Input
              id={IDENTIFICACION.razon_social.key}
              error={errors.razon_social?.message}
              readOnly
              className={`${SESSION_LOCKED_CLASS} uppercase`}
              {...register("razon_social")}
            />
          </div>
          <div>
            <Label htmlFor={IDENTIFICACION.nit.key} required>
              {IDENTIFICACION.nit.label}
            </Label>
            <Input
              id={IDENTIFICACION.nit.key}
              error={errors.nit?.message}
              readOnly
              className={SESSION_LOCKED_CLASS}
              {...register("nit")}
            />
          </div>
          <div>
            <Label htmlFor={IDENTIFICACION.establecimiento.key} required>
              {IDENTIFICACION.establecimiento.label}
            </Label>
            <Input
              id={IDENTIFICACION.establecimiento.key}
              error={errors.establecimiento?.message}
              readOnly
              className={`${SESSION_LOCKED_CLASS} uppercase`}
              {...register("establecimiento")}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor={IDENTIFICACION.direccion.key} required>
              {IDENTIFICACION.direccion.label}
            </Label>
            <Input
              id={IDENTIFICACION.direccion.key}
              error={errors.direccion?.message}
              readOnly
              className={`${SESSION_LOCKED_CLASS} uppercase`}
              {...register("direccion")}
            />
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
                  className="uppercase"
                  placeholder={TEXTO_PREDETERMINADO}
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
        description="Evalúe cada ítem como C (Conforme), NC (No Conforme) o N/A. En ítems fotográficos, dispare varios ángulos: cada foto se guarda sola en el celular. El registro oficial se arma en oficina."
      >
        <div
          role="alert"
          className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
        >
          {REGISTRO_FOTOGRAFICO_ALERT}
        </div>
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
                    itemKey={item.key}
                    fileNamePrefix={inspeccionCodigo}
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
              className="uppercase"
              placeholder={TEXTO_PREDETERMINADO}
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
              className="uppercase"
              placeholder={TEXTO_PREDETERMINADO}
              rows={4}
              {...register("observaciones_tecnicas")}
            />
          </div>
        </div>
      </SectionCard>

      <div
        role="alert"
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
      >
        {REGISTRO_FOTOGRAFICO_ALERT}
      </div>

      <SubmitBar>
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? "Enviando…" : "Enviar checklist"}
        </Button>
      </SubmitBar>
    </form>
  );
}
