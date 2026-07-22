export const ALCANCE_INSPECCION =
  "Inspección de estaciones de servicio automotriz de combustibles líquidos";

export const CONDICIONES_GENERALES = [
  {
    key: "sitio_limpio",
    label: "Sitio limpio y en operación normal",
    criterio: "Área de islas limpias, sin derrames visibles",
  },
  {
    key: "senalizacion_visible",
    label: "Señalización visible y adecuada",
    criterio:
      "Señalizaciones de seguridad visibles y ubicadas en sitios correctos",
  },
  {
    key: "acceso_seguro",
    label: "Acceso seguro a cada componente inspeccionado",
    criterio: "Accesos despejados, a todas las zonas de la EDS",
  },
  {
    key: "personal_informado",
    label: "Personal informado y disponible",
    criterio: "Personal de la EDS acompañó la inspección",
  },
] as const;

export const EVIDENCIA_TIPOS = [
  "fotografica",
  "documental",
  "directa",
] as const;

export type EvidenciaTipo = (typeof EVIDENCIA_TIPOS)[number];

export const EVIDENCIA_TIPO_LABELS: Record<EvidenciaTipo, string> = {
  fotografica: "Registro fotográfico",
  documental: "Verificación documental",
  directa: "Verificación directa",
};

export const EVIDENCIA_PLACEHOLDERS: Record<EvidenciaTipo, string> = {
  fotografica: "Describa / referencie la evidencia fotográfica…",
  documental: "Referencie documento, certificado o bitácora…",
  directa: "Observaciones de la verificación directa…",
};

export const CAMPO_INSPECTION_ITEMS = [
  {
    key: "oficinas_bodegas",
    label: "Oficinas y bodegas",
    criterio: "Construcción en material incombustible, ordenadas",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "banos",
    label: "Baños",
    criterio: "Independientes, limpios y funcionales",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "residuos_peligrosos",
    label: "Residuos peligrosos",
    criterio: "Área techada, señalizada y con acceso restringido",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Verificación directa + Registro fotográfico (+ certificados disposición)",
  },
  {
    key: "instalaciones_electricas",
    label: "Instalaciones eléctricas",
    criterio: "Conforme a RETIE",
    tipoEvidencia: "documental",
    evidenciaRequerida:
      "Verificación directa + documental (RETIE/dictamen)",
  },
  {
    key: "senalizacion",
    label: "Señalización",
    criterio: "Avisos de seguridad visibles, en zona de tanques e islas",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Verificación directa + Registro fotográfico (avisos/pictogramas)",
  },
  {
    key: "extintores",
    label: "Extintores",
    criterio:
      "Extintores vigentes y en buen estado. Dos por isla, dos en oficina y uno en zona de tanques",
    tipoEvidencia: "directa",
    evidenciaRequerida: "Verificación directa + programa/inspección",
  },
  {
    key: "parada_emergencia",
    label: "Parada de emergencia",
    criterio: "Botón funcional, señalizado",
    tipoEvidencia: "documental",
    evidenciaRequerida:
      "Verificación directa + documental (bitácora de prueba mensual)",
  },
  {
    key: "fuente_ignicion",
    label: "Fuente de ignición más cercana",
    criterio: "Ubicada a más de 6 mts de la isla más cercana",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "drenaje_trampa",
    label: "Drenaje / trampa de grasas",
    criterio: "Canal perimetral operativo, trampa de grasas limpia",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Verificación directa + Registro fotográfico (sistema aguas / trampas)",
  },
  {
    key: "zona_parqueos",
    label: "Zona de parqueos",
    criterio: "Delimitada y señalizada",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "prueba_calidad_combustible",
    label: "Prueba aleatoria de calidad de combustible",
    criterio: "Pomada realizada, resultado conforme",
    tipoEvidencia: "documental",
    evidenciaRequerida:
      "Verificación directa/documental (muestreo, bitácora)",
  },
  {
    key: "avisos_marca",
    label: "Avisos de marca mayorista/minorista",
    criterio: "Visibles en canopy y surtidores",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Registro fotográfico (identificación marca)",
  },
  {
    key: "avisos_precios",
    label: "Avisos de precios",
    criterio: "Visibles en surtidores y tablero de precios",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "barreras_proteccion",
    label: "Barreras de protección",
    criterio:
      "Ubicadas en perímetro de islas y cumple con la altura y diámetro",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "dispensadores",
    label: "Dispensadores",
    criterio: "Cuentan con válvulas contra impactos",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "cajas_contenedoras_surtidores",
    label: "Cajas contenedoras de surtidores",
    criterio: "Limpias, secas, en buen estado",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Registro fotográfico + certificados UL / estanqueidad",
  },
  {
    key: "puesta_tierra_surtidores",
    label: "Puesta a tierra de surtidores",
    criterio: "Cada uno cuenta con puesta a tierra",
    tipoEvidencia: "documental",
    evidenciaRequerida:
      "Verificación documental (mediciones/continuidad)",
  },
  {
    key: "mangueras",
    label: "Mangueras",
    criterio: "Resistentes, con breakaway y swivels",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Certificados + Registro fotográfico",
  },
  {
    key: "pistolas",
    label: "Pistolas",
    criterio: "Certificación UL",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Certificados UL-2586 + Registro fotográfico",
  },
  {
    key: "canopy",
    label: "Canopy",
    criterio: "Instalado, estructura en buen estado",
    tipoEvidencia: "directa",
    evidenciaRequerida:
      "Verificación directa (relación tanques/edificación-canopy)",
  },
  {
    key: "identificacion_tanques",
    label: "Identificación de tanques",
    criterio: "Enumerados y señalizados",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "tubos_desfogues",
    label: "Tubos de desfogues",
    criterio: "Con válvula presión-vacío, diámetro 32 mm",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Verificación directa + Registro fotográfico (+ ficha/certificado válvula)",
  },
  {
    key: "bocas_llenado",
    label: "Bocas de llenado",
    criterio: "Spill container sin residuos acumulados y tapas herméticas",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "cajas_contenedoras_tanques",
    label: "Cajas contenedoras de tanques",
    criterio: "Limpias, secas y en buen estado",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Verificación directa + Registro fotográfico (+ UL 2447)",
  },
  {
    key: "puesta_tierra_tanques",
    label: "Puesta a tierra zona de tanques",
    criterio: "Malla eléctrica y varilla visible",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "estado_piso",
    label: "Estado del piso en zonas críticas",
    criterio: "Pavimento en buen estado",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Verificación directa + Registro fotográfico (losa/pendiente)",
  },
  {
    key: "rejillas_perimetrales",
    label: "Rejillas perimetrales",
    criterio: "Limpias y ubicadas en zona de tanques e islas",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
] as const;

export const EVALUATION_OPTIONS = [
  { value: "C", label: "C" },
  { value: "NC", label: "NC" },
  { value: "NA", label: "N/A" },
] as const;

export const SI_NO_OPTIONS = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
] as const;

export const ETAPA_DOS_OPTIONS = [
  { value: "CUMPLE", label: "CUMPLE" },
  { value: "NO_CUMPLE", label: "NO CUMPLE" },
] as const;
