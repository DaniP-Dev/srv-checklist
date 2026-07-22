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
    key: "banos_publico",
    label: "Instalaciones sanitarias para el público",
    criterio: "Independientes, limpios y funcionales",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "banos_personal",
    label: "Instalaciones sanitarias para el personal",
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
    key: "zona_parqueos",
    label: "Zona de parqueos",
    criterio: "Delimitada y señalizada",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
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
    key: "senalizacion_tuberias",
    label: "Señalización de tuberías y sentido de flujo",
    criterio: "Avisos visibles con sentido de flujo",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "senalizacion_almacenamiento",
    label: "Avisos/pictogramas de seguridad en almacenamiento",
    criterio: "Pictogramas visibles en zona de tanques",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "senalizacion_abastecimiento",
    label: "Avisos/pictogramas de seguridad en abastecimiento",
    criterio: "Pictogramas visibles en islas / surtidores",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "extintores",
    label: "Extintores",
    criterio:
      "Extintores vigentes y en buen estado. Dos por isla, dos en oficina, uno en zona de tanques; satelital si aplica",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Registro fotográfico (existencia, llenado tanques, satelital)",
  },
  {
    key: "parada_emergencia",
    label: "Parada de emergencia",
    criterio: "Botón funcional, señalizado",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Registro fotográfico + bitácora de prueba mensual (en notas)",
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
    label: "Trampa de grasas",
    criterio: "Trampa de grasas limpia y operativa",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "rejillas_perimetrales",
    label: "Canal de aguas hidrocarburadas, rejillas, sumideros",
    criterio: "Canal perimetral operativo; rejillas limpias en tanques e islas",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "area_abastecimiento",
    label: "Área de abastecimiento de vehículos",
    criterio: "Área de islas en buen estado y operativa",
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
    key: "avisos_precios_entradas",
    label: "Avisos de precios en entradas",
    criterio: "Visibles en entradas de la EDS",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "avisos_precios_surtidores",
    label: "Precio, tipo y cantidad de combustible en surtidores",
    criterio: "Visibles en surtidores y tablero de precios",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "barreras_proteccion",
    label: "Barreras de protección en equipos de medición",
    criterio:
      "Ubicadas en perímetro de islas; cumple altura y diámetro",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "dispensadores",
    label: "Válvulas de impacto, anclaje y puesta a tierra",
    criterio: "Dispensadores con válvulas contra impactos, anclaje y tierra",
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
    label: "Puesta a tierra de surtidores (mediciones)",
    criterio: "Cada uno cuenta con puesta a tierra verificada",
    tipoEvidencia: "documental",
    evidenciaRequerida:
      "Verificación documental (mediciones/continuidad)",
  },
  {
    key: "pistolas_mangueras",
    label: "Pistolas, mangueras, breakaway y swivel",
    criterio: "Certificación UL; mangueras con breakaway y swivels",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Certificados UL-2586 + Registro fotográfico",
  },
  {
    key: "canopy",
    label: "Cubierta de la(s) isla(s) / Canopy",
    criterio: "Instalado, estructura en buen estado",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "distribucion_islas",
    label: "Distribución de islas",
    criterio: "Distribución conforme a diseño / norma",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "distancia_medidores",
    label: "Distancia entre medidores",
    criterio: "Distancias conformes entre equipos de medición",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "identificacion_tanques",
    label: "Identificación y numeración de tanques",
    criterio: "Enumerados y señalizados",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "identificacion_riesgo_sga",
    label: "Identificación de riesgo según SGA",
    criterio: "Señalización SGA visible en tanques",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "tanques_estacionarios",
    label: "Tanques estacionarios",
    criterio: "Estado general conforme",
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
    key: "panoramica_tanques",
    label: "Panorámica de tanques (superficiales/subterráneos)",
    criterio: "Vista general de la zona de tanques",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Registro fotográfico",
  },
  {
    key: "bocas_llenado",
    label: "Bocas de llenado",
    criterio: "Acceso a bocas de llenado en buen estado",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "pozos_monitoreo",
    label: "Pozos de monitoreo",
    criterio: "Pozos presentes y accesibles",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "spill_container_acople",
    label: "Spill container, acople de carga, sistema sobrellenado",
    criterio: "Spill container sin residuos; acople y sobrellenado operativos",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "tapones_hermeticos",
    label: "Tapones herméticos",
    criterio: "Tapas herméticas en buen estado",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "llenado_remoto",
    label: "Llenado remoto (superficiales)",
    criterio: "Sistema de llenado remoto conforme (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "cajas_contenedoras_tanques",
    label: "Manhole de tanques y caja de derrames",
    criterio: "Limpias, secas y en buen estado",
    tipoEvidencia: "fotografica",
    evidenciaRequerida:
      "Verificación directa + Registro fotográfico (+ UL 2447)",
  },
  {
    key: "puesta_tierra_tanques",
    label: "Conexión a tierra en zona de tanques",
    criterio: "Malla eléctrica y varilla visible",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "tanques_cilindricos_superficie",
    label: "Tanques cilíndricos en superficie",
    criterio: "Estado y disposición conformes (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "recinto_contencion",
    label: "Recinto de contención",
    criterio: "Recinto presente y en buen estado (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "distancia_tanques_recinto",
    label: "Distancia de tanques al recinto",
    criterio: "Distancias conformes (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "distancia_entre_tanques",
    label: "Distancia entre tanques",
    criterio: "Distancias conformes entre tanques",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "panoramica_recinto",
    label: "Panorámica del recinto de construcción",
    criterio: "Vista general del recinto (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Registro fotográfico",
  },
  {
    key: "drenaje_recinto_contencion",
    label: "Drenaje del recinto de contención",
    criterio: "Drenaje operativo (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "valvula_presion_derrames",
    label: "Válvula de presión de derrames",
    criterio: "Válvula presente y conforme (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "aberturas_tanques",
    label: "Aberturas de tanques",
    criterio: "Aberturas conformes y protegidas",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "anclaje_tanques",
    label: "Anclaje de tanques",
    criterio: "Anclaje visible y conforme (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "barreras_proteccion_tanques",
    label: "Barreras de protección (zona de tanques)",
    criterio: "Barreras en perímetro de tanques",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "altura_recinto_tanques",
    label: "Altura del recinto de tanques",
    criterio: "Altura conforme (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "valvula_flujo_gravedad",
    label: "Válvula de flujo por gravedad",
    criterio: "Válvula presente y conforme (si aplica)",
    tipoEvidencia: "fotografica",
    evidenciaRequerida: "Verificación directa + Registro fotográfico",
  },
  {
    key: "pruebas_cajas_sin_liquidos",
    label: "Pruebas periódicas: ausencia de líquidos en cajas",
    criterio: "Cajas sin líquidos acumulados",
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
