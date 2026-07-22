"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SignaturePad,
  type SignaturePadHandle,
} from "@/components/forms/signature-pad";
import { SubmitBar } from "@/components/forms/submit-bar";
import { Button } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { FormStatusBanner } from "@/components/ui/form-status-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { SectionCard } from "@/components/ui/section-card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmSessionModal } from "@/features/acta-tecnica/ConfirmSessionModal";
import { useFormDraft } from "@/hooks/use-form-draft";
import { IDENTIFICACION } from "@/lib/identificacion";
import {
  saveSession,
  type InspectionSessionInput,
} from "@/lib/offline/session";
import {
  CONDICION_ESTADO_OPTIONS,
  CONDICIONES_SITIO,
  ENCUESTA_PREGUNTAS,
  EPP_OPTIONS,
  PERMISOS_REQUERIDOS,
  PQRS_TEXTO,
  RESULTADO_OPTIONS,
  RIESGOS_IDENTIFICADOS,
  TIPO_INSPECCION_OPTIONS,
} from "@/features/acta-tecnica/constants";
import {
  actaTecnicaSchema,
  createActaTecnicaDefaults,
  toActaTecnicaPayload,
  type ActaTecnicaFormValues,
} from "@/features/acta-tecnica/types";

const SESSION_FIELDS = [
  "codigo",
  "tipo_inspeccion",
  "razon_social",
  "nit",
  "codigo_sicom",
  "establecimiento",
  "direccion",
  "inspector_nombre",
] as const satisfies readonly (keyof ActaTecnicaFormValues)[];

function toSessionInput(values: ActaTecnicaFormValues): InspectionSessionInput {
  return {
    codigo: values.codigo.trim(),
    tipoInspeccion: values.tipo_inspeccion,
    razon_social: values.razon_social.trim(),
    nit: values.nit.trim(),
    codigo_sicom: values.codigo_sicom.trim(),
    establecimiento: values.establecimiento.trim(),
    direccion: values.direccion.trim(),
    inspector_nombre: values.inspector_nombre.trim(),
    inspector_celular: values.inspector_celular.trim() || undefined,
    inspector_correo: values.inspector_correo.trim() || undefined,
  };
}

export function ActaInspeccionTecnicaForm() {
  const router = useRouter();
  const firmaClienteRef = useRef<SignaturePadHandle>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionPreview, setSessionPreview] =
    useState<InspectionSessionInput | null>(null);
  const [confirmingSession, setConfirmingSession] = useState(false);

  const form = useForm<ActaTecnicaFormValues>({
    resolver: zodResolver(actaTecnicaSchema),
    defaultValues: createActaTecnicaDefaults(),
  });

  const {
    register,
    control,
    getValues,
    trigger,
    formState: { errors },
  } = form;

  const onDraftLoaded = useCallback((values: ActaTecnicaFormValues) => {
    if (values.firma_cliente) {
      // Esperar a que el pad monte el canvas
      window.setTimeout(() => {
        firmaClienteRef.current?.fromDataURL(values.firma_cliente);
      }, 100);
    }
  }, []);

  useFormDraft("acta-tecnica", form, {
    onDraftLoaded,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "personas",
  });

  const riesgosIdentificados = useWatch({
    control,
    name: "riesgos_identificados",
  });
  const muestraRiesgoOtro = riesgosIdentificados?.includes("otro") ?? false;

  function buildSessionInput(): InspectionSessionInput {
    const values = getValues();
    const firma =
      firmaClienteRef.current?.getDataURL() ?? values.firma_cliente;
    const valuesWithFirma = { ...values, firma_cliente: firma ?? "" };

    return {
      ...toSessionInput(valuesWithFirma),
      acta_completa: toActaTecnicaPayload(valuesWithFirma),
    };
  }

  async function handleContinueClick() {
    const valid = await trigger([...SESSION_FIELDS]);
    if (!valid) {
      setStatus("error");
      setStatusMessage(
        "Complete identificación, tipo de inspección e inspector para continuar.",
      );
      return;
    }

    setStatus("idle");
    setStatusMessage(undefined);
    setSessionPreview(buildSessionInput());
    setModalOpen(true);
  }

  async function handleConfirmSession() {
    if (!sessionPreview) return;

    setConfirmingSession(true);
    try {
      const sessionInput = buildSessionInput();
      await saveSession(sessionInput);
      setModalOpen(false);

      if (sessionInput.tipoInspeccion === "EDS") {
        router.push("/inspeccion/checklist-campo");
        return;
      }

      setStatus("success");
      setStatusMessage(
        "Sesión de Hermeticidad guardada. El checklist correspondiente estará disponible próximamente.",
      );
      router.push("/");
    } catch {
      setStatus("error");
      setStatusMessage("No se pudo guardar la sesión de inspección.");
      setModalOpen(false);
    } finally {
      setConfirmingSession(false);
    }
  }

  return (
    <>
    <form
      onSubmit={(event) => event.preventDefault()}
      className="space-y-6 pb-submit-safe"
    >
      <FormStatusBanner status={status} message={statusMessage} />

      <SectionCard
        title="Información General"
        description="Datos del establecimiento y del código de inspección."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={IDENTIFICACION.codigo.key} required>
              {IDENTIFICACION.codigo.label}
            </Label>
            <Input
              id={IDENTIFICACION.codigo.key}
              error={errors.codigo?.message}
              {...register("codigo")}
            />
          </div>
          <div>
            <Label htmlFor="tipo_inspeccion" required>
              Tipo de inspección
            </Label>
            <Select
              id="tipo_inspeccion"
              options={[...TIPO_INSPECCION_OPTIONS]}
              error={errors.tipo_inspeccion?.message}
              {...register("tipo_inspeccion")}
            />
          </div>
          <div>
            <Label htmlFor={IDENTIFICACION.razon_social.key} required>
              {IDENTIFICACION.razon_social.label}
            </Label>
            <Input
              id={IDENTIFICACION.razon_social.key}
              error={errors.razon_social?.message}
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
              {...register("nit")}
            />
          </div>
          <div>
            <Label htmlFor={IDENTIFICACION.codigo_sicom.key} required>
              {IDENTIFICACION.codigo_sicom.label}
            </Label>
            <Input
              id={IDENTIFICACION.codigo_sicom.key}
              error={errors.codigo_sicom?.message}
              {...register("codigo_sicom")}
            />
          </div>
          <div>
            <Label htmlFor={IDENTIFICACION.establecimiento.key} required>
              {IDENTIFICACION.establecimiento.label}
            </Label>
            <Input
              id={IDENTIFICACION.establecimiento.key}
              error={errors.establecimiento?.message}
              {...register("establecimiento")}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={IDENTIFICACION.direccion.key} required>
              {IDENTIFICACION.direccion.label}
            </Label>
            <Input
              id={IDENTIFICACION.direccion.key}
              error={errors.direccion?.message}
              {...register("direccion")}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Inspector Asignado">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="inspector_nombre" required>
              Nombre
            </Label>
            <Input
              id="inspector_nombre"
              error={errors.inspector_nombre?.message}
              {...register("inspector_nombre")}
            />
          </div>
          <div>
            <Label htmlFor="inspector_celular" required>
              Celular
            </Label>
            <Input
              id="inspector_celular"
              type="tel"
              error={errors.inspector_celular?.message}
              {...register("inspector_celular")}
            />
          </div>
          <div>
            <Label htmlFor="inspector_correo" required>
              Correo electrónico
            </Label>
            <Input
              id="inspector_correo"
              type="email"
              error={errors.inspector_correo?.message}
              {...register("inspector_correo")}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Personas que Reciben la Visita"
        description="Agregue una fila por cada persona presente."
      >
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-border bg-background/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-muted">
                  Persona {index + 1}
                </p>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-12 text-base text-danger"
                    onClick={() => remove(index)}
                  >
                    Eliminar
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                <div>
                  <Label htmlFor={`personas.${index}.nombre`} required>
                    Nombre
                  </Label>
                  <Input
                    id={`personas.${index}.nombre`}
                    error={errors.personas?.[index]?.nombre?.message}
                    {...register(`personas.${index}.nombre`)}
                  />
                </div>
                <div>
                  <Label htmlFor={`personas.${index}.cargo`} required>
                    Cargo
                  </Label>
                  <Input
                    id={`personas.${index}.cargo`}
                    error={errors.personas?.[index]?.cargo?.message}
                    {...register(`personas.${index}.cargo`)}
                  />
                </div>
                <div>
                  <Label htmlFor={`personas.${index}.fecha`} required>
                    Fecha
                  </Label>
                  <Input
                    id={`personas.${index}.fecha`}
                    type="date"
                    error={errors.personas?.[index]?.fecha?.message}
                    {...register(`personas.${index}.fecha`)}
                  />
                </div>
                <div>
                  <Label htmlFor={`personas.${index}.hora_inicial`} required>
                    Hora inicial
                  </Label>
                  <Input
                    id={`personas.${index}.hora_inicial`}
                    type="time"
                    error={errors.personas?.[index]?.hora_inicial?.message}
                    {...register(`personas.${index}.hora_inicial`)}
                  />
                </div>
                <div>
                  <Label htmlFor={`personas.${index}.hora_cierre`} required>
                    Hora cierre
                  </Label>
                  <Input
                    id={`personas.${index}.hora_cierre`}
                    type="time"
                    error={errors.personas?.[index]?.hora_cierre?.message}
                    {...register(`personas.${index}.hora_cierre`)}
                  />
                </div>
              </div>
            </div>
          ))}
          {errors.personas?.root?.message || errors.personas?.message ? (
            <p className="text-sm text-danger" role="alert">
              {errors.personas?.root?.message || errors.personas?.message}
            </p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              append({
                nombre: "",
                cargo: "",
                fecha: new Date().toISOString().slice(0, 10),
                hora_inicial: "",
                hora_cierre: "",
              })
            }
          >
            + Agregar persona
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Condiciones del Sitio">
        <div className="space-y-4">
          {CONDICIONES_SITIO.map((item) => (
            <div
              key={item.key}
              className="grid gap-3 rounded-lg border border-border bg-background/50 p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
            >
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <Controller
                  control={control}
                  name={`condiciones.${item.key}.estado`}
                  render={({ field }) => (
                    <RadioGroup
                      name={`condicion-${item.key}`}
                      variant="segmented"
                      options={[...CONDICION_ESTADO_OPTIONS]}
                      value={field.value}
                      onChange={field.onChange}
                      error={
                        errors.condiciones?.[item.key]?.estado?.message
                      }
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor={`condicion-obs-${item.key}`}>
                  Observaciones
                </Label>
                <Input
                  id={`condicion-obs-${item.key}`}
                  placeholder="Opcional"
                  {...register(`condiciones.${item.key}.observaciones`)}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Seguridad y ATS"
        description="Permisos, EPP, riesgos y análisis de trabajo seguro."
      >
        <div className="space-y-5">
          <div>
            <Label>Permisos requeridos</Label>
            <Controller
              control={control}
              name="permisos_requeridos"
              render={({ field }) => (
                <CheckboxGroup
                  name="permisos_requeridos"
                  options={[...PERMISOS_REQUERIDOS]}
                  values={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div>
            <Label>EPP del inspector</Label>
            <Controller
              control={control}
              name="epp"
              render={({ field }) => (
                <CheckboxGroup
                  name="epp"
                  options={[...EPP_OPTIONS]}
                  values={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div>
            <Label>Riesgos identificados</Label>
            <Controller
              control={control}
              name="riesgos_identificados"
              render={({ field }) => (
                <CheckboxGroup
                  name="riesgos_identificados"
                  options={[...RIESGOS_IDENTIFICADOS]}
                  values={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {muestraRiesgoOtro ? (
              <div className="mt-3">
                <Label htmlFor="riesgo_otro" required>
                  Especifique el riesgo «Otro»
                </Label>
                <Input
                  id="riesgo_otro"
                  error={errors.riesgo_otro?.message}
                  {...register("riesgo_otro")}
                />
              </div>
            ) : null}
          </div>
          <div>
            <Label htmlFor="actividades">Actividades realizadas</Label>
            <Textarea id="actividades" {...register("actividades")} />
          </div>
          <div>
            <Label htmlFor="equipos">Equipos/herramientas utilizadas</Label>
            <Textarea id="equipos" {...register("equipos")} />
          </div>
          <div>
            <Label htmlFor="medidas_preventivas">
              Medidas preventivas aplicadas
            </Label>
            <Textarea
              id="medidas_preventivas"
              {...register("medidas_preventivas")}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Observaciones Adicionales">
        <Textarea
          id="observaciones_adicionales"
          rows={4}
          {...register("observaciones_adicionales")}
        />
      </SectionCard>

      <SectionCard title="Resultado de la Inspección">
        <div className="space-y-4">
          <div>
            <Label required>Resultado</Label>
            <Controller
              control={control}
              name="resultado"
              render={({ field }) => (
                <RadioGroup
                  name="resultado"
                  variant="segmented"
                  options={[...RESULTADO_OPTIONS]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.resultado?.message}
                />
              )}
            />
          </div>
          <p className="rounded-lg border border-border bg-background/50 px-4 py-3 text-sm text-muted">
            {PQRS_TEXTO}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Firma de Aceptación">
        <div className="mx-auto max-w-xl space-y-4">
          <p className="text-sm font-semibold text-foreground">
            Encargado de la EDS / Cliente
          </p>
          <div>
            <Label htmlFor="firma_cliente_nombre" required>
              Nombre
            </Label>
            <Input
              id="firma_cliente_nombre"
              error={errors.firma_cliente_nombre?.message}
              {...register("firma_cliente_nombre")}
            />
          </div>
          <div>
            <Label htmlFor="firma_cliente_cargo" required>
              Cargo
            </Label>
            <Input
              id="firma_cliente_cargo"
              error={errors.firma_cliente_cargo?.message}
              {...register("firma_cliente_cargo")}
            />
          </div>
          <div>
            <Label htmlFor="firma_cliente_fecha" required>
              Fecha
            </Label>
            <Input
              id="firma_cliente_fecha"
              type="date"
              error={errors.firma_cliente_fecha?.message}
              {...register("firma_cliente_fecha")}
            />
          </div>
          <div>
            <Controller
              control={control}
              name="firma_cliente"
              render={({ field }) => (
                <SignaturePad
                  ref={firmaClienteRef}
                  label="Firma"
                  onChange={(dataUrl) => field.onChange(dataUrl ?? "")}
                />
              )}
            />
            {errors.firma_cliente?.message ? (
              <p className="mt-1 text-sm text-danger" role="alert">
                {errors.firma_cliente.message}
              </p>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Encuesta de Satisfacción del Servicio"
        description="Voluntaria. Si lo desea, diligencie esta breve encuesta para ayudarnos a mejorar."
      >
        <div className="space-y-5">
          {ENCUESTA_PREGUNTAS.map((pregunta) => (
            <div key={pregunta.key}>
              <Label>{pregunta.label}</Label>
              <Controller
                control={control}
                name={`encuesta.${pregunta.key}`}
                render={({ field }) => (
                  <RadioGroup
                    name={`encuesta-${pregunta.key}`}
                    variant="segmented"
                    options={[...pregunta.options]}
                    value={field.value || undefined}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SubmitBar>
        <Button
          type="button"
          disabled={confirmingSession}
          onClick={() => void handleContinueClick()}
          className="w-full md:w-auto"
        >
          Continuar al checklist
        </Button>
      </SubmitBar>
    </form>

    <ConfirmSessionModal
      open={modalOpen}
      data={sessionPreview}
      confirming={confirmingSession}
      onCancel={() => {
        if (confirmingSession) return;
        setModalOpen(false);
      }}
      onConfirm={() => void handleConfirmSession()}
    />
    </>
  );
}
