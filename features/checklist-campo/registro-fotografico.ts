/**
 * Catálogo 1:1 con el documento oficial
 * "VERIFICACION FOTOGRAFICA DE LA ETAPA DE CAMPO".
 *
 * `itemKey` apunta al ítem de `CAMPO_INSPECTION_ITEMS` que aporta
 * evaluación + foto. Varios códigos pueden compartir el mismo ítem
 * (p. ej. extintores 5.5.1–5.5.3).
 */
export const REGISTRO_FOTOGRAFICO_ASPECTOS = [
  {
    codigo: "4.1.1",
    aspecto:
      "Panorámica de la EDS (infraestructura: oficinas, bodegas, talleres)",
    itemKey: "oficinas_bodegas",
  },
  {
    codigo: "4.1.2",
    aspecto: "Instalaciones sanitarias para el público",
    itemKey: "banos_publico",
  },
  {
    codigo: "4.1.3",
    aspecto: "Instalaciones sanitarias para el personal",
    itemKey: "banos_personal",
  },
  {
    codigo: "4.1.4",
    aspecto:
      "Área de almacenamiento temporal de residuos peligrosos (RESPEL)",
    itemKey: "residuos_peligrosos",
  },
  {
    codigo: "4.1.5",
    aspecto: "Zona de estacionamiento temporal/parqueadero de vehículos",
    itemKey: "zona_parqueos",
  },
  {
    codigo: "4.2.1",
    aspecto: "Señalización de tuberías y sentido de flujo",
    itemKey: "senalizacion_tuberias",
  },
  {
    codigo: "5.1.1",
    aspecto: "Avisos de precios en entradas",
    itemKey: "avisos_precios_entradas",
  },
  {
    codigo: "5.1.2",
    aspecto: "Aviso/logo de marca comercial y nombre de la EDS",
    itemKey: "avisos_marca",
  },
  {
    codigo: "5.1.3",
    aspecto: "Pistolas, mangueras, breakwey, swivel",
    itemKey: "pistolas_mangueras",
  },
  {
    codigo: "5.1.4",
    aspecto: "Barreras de protección en equipos de medición",
    itemKey: "barreras_proteccion",
  },
  {
    codigo: "5.1.5",
    aspecto: "Válvulas de impacto, anclaje y puesta a tierra",
    itemKey: "dispensadores",
  },
  {
    codigo: "5.1.6",
    aspecto: "Caja de contención de derrames",
    itemKey: "cajas_contenedoras_surtidores",
  },
  {
    codigo: "5.1.7",
    aspecto: "Precio, tipo y cantidad de combustible en surtidores",
    itemKey: "avisos_precios_surtidores",
  },
  {
    codigo: "5.1.8",
    aspecto: "Distancia entre equipo y fuente de ignición",
    itemKey: "fuente_ignicion",
  },
  {
    codigo: "5.2.1",
    aspecto: "Cubierta de la(s) isla(s)",
    itemKey: "canopy",
  },
  {
    codigo: "5.2.2",
    aspecto: "Avisos/pictogramas de seguridad en almacenamiento",
    itemKey: "senalizacion_almacenamiento",
  },
  {
    codigo: "5.2.3",
    aspecto: "Avisos/pictogramas de seguridad en abastecimiento",
    itemKey: "senalizacion_abastecimiento",
  },
  {
    codigo: "5.3.1",
    aspecto: "Identificación y numeración de tanques",
    itemKey: "identificacion_tanques",
  },
  {
    codigo: "5.3.2",
    aspecto: "Identificación de riesgo según SGA",
    itemKey: "identificacion_riesgo_sga",
  },
  {
    codigo: "5.3.3",
    aspecto: "Tanques estacionarios",
    itemKey: "tanques_estacionarios",
  },
  {
    codigo: "5.3.4",
    aspecto: "Tubos de desfogue y diámetro",
    itemKey: "tubos_desfogues",
  },
  {
    codigo: "5.3.5",
    aspecto: "Panorámica de tanques (superficiales/subterráneos)",
    itemKey: "panoramica_tanques",
  },
  {
    codigo: "5.3.6",
    aspecto: "Bocas de llenado",
    itemKey: "bocas_llenado",
  },
  {
    codigo: "5.3.7",
    aspecto: "Pozos de monitoreo",
    itemKey: "pozos_monitoreo",
  },
  {
    codigo: "5.3.8",
    aspecto: "Spill container, acople de carga, sistema sobrellenado",
    itemKey: "spill_container_acople",
  },
  {
    codigo: "5.3.9",
    aspecto: "Tapones herméticos",
    itemKey: "tapones_hermeticos",
  },
  {
    codigo: "5.3.10",
    aspecto: "Llenado remoto (superficiales)",
    itemKey: "llenado_remoto",
  },
  {
    codigo: "5.3.11",
    aspecto: "Manhole de tanques y caja de derrames",
    itemKey: "cajas_contenedoras_tanques",
  },
  {
    codigo: "5.3.12",
    aspecto: "Conexión a tierra en zona de tanques",
    itemKey: "puesta_tierra_tanques",
  },
  {
    codigo: "5.3.13",
    aspecto: "Tanques cilíndricos en superficie",
    itemKey: "tanques_cilindricos_superficie",
  },
  {
    codigo: "5.3.14",
    aspecto: "Recinto de contención",
    itemKey: "recinto_contencion",
  },
  {
    codigo: "5.3.15",
    aspecto: "Distancia de tanques al recinto",
    itemKey: "distancia_tanques_recinto",
  },
  {
    codigo: "5.3.16",
    aspecto: "Distancia entre tanques",
    itemKey: "distancia_entre_tanques",
  },
  {
    codigo: "5.3.17",
    aspecto: "Panorámica del recinto de construcción",
    itemKey: "panoramica_recinto",
  },
  {
    codigo: "5.3.18",
    aspecto: "Drenaje del recinto de contención",
    itemKey: "drenaje_recinto_contencion",
  },
  {
    codigo: "5.3.19",
    aspecto: "Válvula de presión de derrames",
    itemKey: "valvula_presion_derrames",
  },
  {
    codigo: "5.3.20",
    aspecto: "Aberturas de tanques",
    itemKey: "aberturas_tanques",
  },
  {
    codigo: "5.3.21",
    aspecto: "Anclaje de tanques",
    itemKey: "anclaje_tanques",
  },
  {
    codigo: "5.3.22",
    aspecto: "Barreras de protección",
    itemKey: "barreras_proteccion_tanques",
  },
  {
    codigo: "5.3.23",
    aspecto: "Altura del recinto de tanques",
    itemKey: "altura_recinto_tanques",
  },
  {
    codigo: "5.3.24",
    aspecto: "Válvula de flujo por gravedad",
    itemKey: "valvula_flujo_gravedad",
  },
  {
    codigo: "5.5.1",
    aspecto: "Existencia de extintores",
    itemKey: "extintores",
  },
  {
    codigo: "5.5.2",
    aspecto: "Extintor para llenado de tanques",
    itemKey: "extintores",
  },
  {
    codigo: "5.5.3",
    aspecto: "Extintor satelital (si aplica)",
    itemKey: "extintores",
  },
  {
    codigo: "5.5.4",
    aspecto: "Parada de emergencia",
    itemKey: "parada_emergencia",
  },
  {
    codigo: "5.6.2",
    aspecto: "Pruebas periódicas: ausencia de líquidos en cajas",
    itemKey: "pruebas_cajas_sin_liquidos",
  },
  {
    codigo: "6.1.1",
    aspecto: "Trampa de grasas",
    itemKey: "drenaje_trampa",
  },
  {
    codigo: "6.1.2",
    aspecto: "Canal de aguas hidrocarburadas, rejillas, sumideros",
    itemKey: "rejillas_perimetrales",
  },
  {
    codigo: "6.1.3",
    aspecto: "Área de abastecimiento de vehículos",
    itemKey: "area_abastecimiento",
  },
  {
    codigo: "6.2.1",
    aspecto: "Distribución de islas",
    itemKey: "distribucion_islas",
  },
  {
    codigo: "6.2.2",
    aspecto: "Distancia entre medidores",
    itemKey: "distancia_medidores",
  },
] as const;

export type RegistroFotograficoAspecto =
  (typeof REGISTRO_FOTOGRAFICO_ASPECTOS)[number];

export type RegistroFotograficoCodigo =
  RegistroFotograficoAspecto["codigo"];

export type RegistroFotograficoItemKey =
  RegistroFotograficoAspecto["itemKey"];

/** Garantiza en compile-time que todo itemKey exista en el checklist. */
type CampoItemKey = (typeof import("./constants").CAMPO_INSPECTION_ITEMS)[number]["key"];
type AssertRegistroKeysExtendCampo = RegistroFotograficoItemKey extends CampoItemKey
  ? true
  : never;
const _assertRegistroKeys: AssertRegistroKeysExtendCampo = true;
void _assertRegistroKeys;
