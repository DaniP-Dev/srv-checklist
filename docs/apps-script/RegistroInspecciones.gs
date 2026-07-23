/**
 * REGISTRO DE INSPECCIONES — Google Apps Script (doPost)
 *
 * Sheet = índice metadatos (columnas A–M). Drive = Docs + fotos + payload.json.
 * NUNCA escribir JSON completo ni base64 en celdas.
 *
 * Pegar este archivo en un proyecto Apps Script vinculado al Spreadsheet
 * (o con acceso al Sheet por ID). Completar CONFIG abajo, desplegar como
 * Web App (Ejecutar como: yo · Quién tiene acceso: Cualquiera) y copiar
 * la URL a GOOGLE_SHEETS_WEBHOOK_URL en Vercel/Next.
 *
 * Plantillas Google Docs: usar placeholders {{CLAVE}} y {{FOTO_4.1.1}}, etc.
 */

// ─── CONFIG (editar una vez) ───────────────────────────────────────────────
var SHEET_NAME = "REGISTRO DE INSPECCIONES";
/** Carpeta raíz en Drive donde se crean expedientes. */
var PARENT_FOLDER_ID = "PEGAR_ID_CARPETA_PADRE";
/** IDs de plantillas Google Docs. */
var TEMPLATE_ACTA_ID = "PEGAR_ID_PLANTILLA_ACTA";
var TEMPLATE_CAMPO_ID = "PEGAR_ID_PLANTILLA_CAMPO";
var TEMPLATE_FOTO_ID = "PEGAR_ID_PLANTILLA_REGISTRO_FOTOGRAFICO";
/** Ancho máximo al insertar fotos en el Doc (puntos). */
var FOTO_WIDTH_PT = 280;

/**
 * Webhook POST desde Next.js (text/plain JSON body).
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: "Body vacío" }, 400);
    }

    var payload = JSON.parse(e.postData.contents);
    if (!payload || !payload.id_inspeccion) {
      return jsonResponse_({ ok: false, error: "id_inspeccion requerido" }, 400);
    }

    if (payload.tipo_formulario === "checklist-campo") {
      processChecklistCampo_(payload);
    } else {
      // Otros tipos: solo log mínimo en Sheet (sin JSON gigante).
      appendMinimalRow_(payload, "OK (tipo " + (payload.tipo_formulario || "?") + ")");
    }

    return jsonResponse_({ ok: true });
  } catch (err) {
    Logger.log(err);
    try {
      appendMinimalRow_(
        (e && e.postData && e.postData.contents
          ? safeParseId_(e.postData.contents)
          : {}) || {},
        "ERROR: " + String(err && err.message ? err.message : err).slice(0, 180),
      );
    } catch (_) {
      /* ignore */
    }
    return jsonResponse_(
      { ok: false, error: String(err && err.message ? err.message : err) },
      500,
    );
  }
}

function processChecklistCampo_(payload) {
  var data = payload.data || {};
  var actaEnv = data.acta || {};
  var checklistEnv = data.checklist || {};
  var acta = actaEnv.data || {};
  var checklist = checklistEnv.data || {};
  var evidencias = data.evidencias_fotograficas || [];

  if (!acta || typeof acta !== "object") {
    throw new Error("Falta data.acta.data");
  }
  if (!checklist || typeof checklist !== "object") {
    throw new Error("Falta data.checklist.data");
  }
  if (!Array.isArray(evidencias)) {
    throw new Error("Falta data.evidencias_fotograficas[]");
  }

  var id = String(payload.id_inspeccion || acta.codigo || "");
  var fecha = String(payload.fecha || checklist.fecha || "");
  var razonSocial = String(acta.razon_social || "");
  var establecimiento = String(
    checklist.establecimiento || acta.establecimiento || "",
  );
  var inspector = String(payload.inspector || checklist.inspector || "");
  var resultadoActa = labelResultado_(acta.resultado);
  var etapaDos = labelEtapaDos_(checklist.etapa_dos);

  var parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  var folderName = safeFolderName_(id + " - " + establecimiento);
  var folder = parent.createFolder(folderName);

  // Payload completo en Drive (no en Sheet).
  folder.createFile(
    Utilities.newBlob(
      JSON.stringify(payload),
      "application/json",
      "payload.json",
    ),
  );

  // Firma cliente → archivo en carpeta.
  var firmaUrl = "";
  if (acta.firma_cliente) {
    var firmaBlob = dataUrlToBlob_(acta.firma_cliente, "firma.png");
    if (firmaBlob) {
      var firmaFile = folder.createFile(firmaBlob);
      firmaFile.setName("firma.png");
      firmaUrl = firmaFile.getUrl();
    }
  }

  // Fotos → JPGs en Drive + mapa codigo_ref → File
  var fotoFilesByRef = {};
  for (var i = 0; i < evidencias.length; i++) {
    var ev = evidencias[i] || {};
    var codigo = String(ev.codigo_ref || "");
    if (!codigo || !ev.foto_base64) continue;

    var baseName = "FOTO_" + codigo.replace(/\./g, "_");
    var blob = dataUrlToBlob_(ev.foto_base64, baseName + ".jpg");
    if (!blob) continue;

    var photoFile = folder.createFile(blob);
    photoFile.setName(baseName + ".jpg");
    // Varias fotos mismo codigo_ref: conservar la última para {{FOTO_X.X.X}}
    // (o ampliar a FOTO_X.X.X_2 si se necesita).
    fotoFilesByRef[codigo] = photoFile;
  }

  // Clonar plantillas y rellenar placeholders básicos + fotos.
  var docActa = copyTemplate_(TEMPLATE_ACTA_ID, "Acta Tecnica - " + id, folder);
  var docCampo = copyTemplate_(
    TEMPLATE_CAMPO_ID,
    "Inspeccion Campo - " + id,
    folder,
  );
  var docFoto = copyTemplate_(
    TEMPLATE_FOTO_ID,
    "Registro Fotografico - " + id,
    folder,
  );

  var commonMap = {
    "{{ID_INSPECCION}}": id,
    "{{FECHA}}": fecha,
    "{{RAZON_SOCIAL}}": razonSocial,
    "{{NIT}}": String(acta.nit || ""),
    "{{ESTABLECIMIENTO}}": establecimiento,
    "{{DIRECCION}}": String(
      checklist.direccion || acta.direccion || "",
    ),
    "{{INSPECTOR}}": inspector,
    "{{RESULTADO}}": resultadoActa,
    "{{ETAPA_DOS}}": etapaDos,
    "{{HALLAZGOS}}": String(checklist.hallazgos || ""),
    "{{OBSERVACIONES_TECNICAS}}": String(
      checklist.observaciones_tecnicas || "",
    ),
  };

  fillPlaceholders_(docActa.getId(), commonMap);
  fillPlaceholders_(docCampo.getId(), commonMap);
  fillPlaceholders_(docFoto.getId(), commonMap);

  var fotoCodes = Object.keys(fotoFilesByRef);
  for (var f = 0; f < fotoCodes.length; f++) {
    var ref = fotoCodes[f];
    replaceFotoPlaceholder_(
      docFoto.getId(),
      "{{FOTO_" + ref + "}}",
      fotoFilesByRef[ref],
    );
  }

  // Sheet: solo A–M metadatos + links. Col M = texto corto.
  var sheet = getRegistroSheet_();
  sheet.appendRow([
    id, // A
    fecha, // B
    razonSocial, // C
    establecimiento, // D
    inspector, // E
    resultadoActa, // F
    etapaDos, // G
    folder.getUrl(), // H Carpeta
    docActa.getUrl(), // I Acta
    docFoto.getUrl(), // J Registro Fotográfico
    docCampo.getUrl(), // K Inspección Campo
    firmaUrl, // L Firma
    "OK (Procesado en Drive)", // M — NUNCA JSON ni base64
  ]);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getRegistroSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "ID Inspección",
      "Fecha",
      "Razón Social",
      "Establecimiento / EDS",
      "Inspector",
      "Resultado Acta",
      "Etapa Dos",
      "Carpeta Drive",
      "Acta",
      "Registro Fotográfico",
      "Inspección Campo",
      "Firma",
      "Estado",
    ]);
  }
  return sheet;
}

function appendMinimalRow_(payload, estado) {
  var sheet = getRegistroSheet_();
  sheet.appendRow([
    String((payload && payload.id_inspeccion) || ""),
    String((payload && payload.fecha) || ""),
    "",
    "",
    String((payload && payload.inspector) || ""),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    String(estado || "").slice(0, 200),
  ]);
}

function copyTemplate_(templateId, name, folder) {
  var template = DriveApp.getFileById(templateId);
  var copy = template.makeCopy(name, folder);
  return copy;
}

function fillPlaceholders_(docId, map) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var keys = Object.keys(map);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    body.replaceText(escapeRegex_(key), String(map[key] == null ? "" : map[key]));
  }
  doc.saveAndClose();
}

/**
 * Busca el placeholder en el Doc, lo elimina e inserta la imagen.
 */
function replaceFotoPlaceholder_(docId, placeholder, file) {
  if (!file) return;
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var found = body.findText(escapeRegex_(placeholder));
  if (!found) {
    doc.saveAndClose();
    return;
  }
  var el = found.getElement();
  var start = found.getStartOffset();
  var end = found.getEndOffsetInclusive();
  var text = el.asText();
  text.deleteText(start, end);

  var parent = el.getParent();
  var blob = file.getBlob();
  try {
    if (parent.getType() === DocumentApp.ElementType.PARAGRAPH) {
      parent.asParagraph().insertInlineImage(0, blob).setWidth(FOTO_WIDTH_PT);
    } else {
      body.insertImage(body.getChildIndex(parent), blob).setWidth(FOTO_WIDTH_PT);
    }
  } catch (imgErr) {
    Logger.log("No se pudo insertar " + placeholder + ": " + imgErr);
    text.insertText(start, "[foto en Drive: " + file.getUrl() + "]");
  }
  doc.saveAndClose();
}

function dataUrlToBlob_(dataUrl, filename) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  var match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  var mime = match[1] || "application/octet-stream";
  var bytes = Utilities.base64Decode(match[2]);
  var blob = Utilities.newBlob(bytes, mime, filename || "file.bin");
  // Normalizar fotos a image/jpeg si el mime es image/*
  if (mime.indexOf("image/") === 0 && filename && /\.jpe?g$/i.test(filename)) {
    blob.setContentType("image/jpeg");
  }
  return blob;
}

function labelResultado_(value) {
  if (value === "conforme") return "Conforme";
  if (value === "no_conforme") return "No Conforme";
  return String(value || "");
}

function labelEtapaDos_(value) {
  if (value === "CUMPLE") return "Cumple";
  if (value === "NO_CUMPLE") return "No Cumple";
  return String(value || "");
}

function safeFolderName_(name) {
  return String(name || "inspeccion")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function escapeRegex_(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeParseId_(raw) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function jsonResponse_(obj, _status) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Despliegue:
 * 1. Completar PARENT_FOLDER_ID y TEMPLATE_*_ID.
 * 2. En el Spreadsheet: Extensiones → Apps Script → pegar este código.
 * 3. Implementar → Nueva implementación → Tipo: Aplicación web.
 * 4. Ejecutar como: su cuenta · Acceso: Cualquiera.
 * 5. Copiar URL → env GOOGLE_SHEETS_WEBHOOK_URL.
 * 6. Encabezados Sheet A–M: ID, Fecha, Razón Social, Establecimiento,
 *    Inspector, Resultado Acta, Etapa Dos, Carpeta, Acta, Registro Foto,
 *    Inspección Campo, Firma, Estado.
 */
