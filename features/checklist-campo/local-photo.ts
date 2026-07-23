const MAX_SIDE_PX = 1280;
const JPEG_QUALITY = 0.7;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    image.src = url;
  });
}

/**
 * Comprime a JPEG Blob para uso local (descarga/compartir).
 * No produce data URL / Base64.
 */
export async function compressImageToJpegBlob(file: File): Promise<Blob> {
  const image = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_SIDE_PX / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo procesar la imagen");
  }
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    throw new Error("No se pudo comprimir la imagen");
  }
  return blob;
}

export function sanitizeFileToken(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return cleaned || "sin_codigo";
}

export function buildPhotoFilename(
  codigo: string,
  itemKey: string,
  index: number,
): string {
  return `${sanitizeFileToken(codigo)}_${sanitizeFileToken(itemKey)}_${index}.jpg`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revocar tras un tick para no cortar la descarga en algunos navegadores.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (typeof navigator.canShare !== "function") {
    return true;
  }
  try {
    const probe = new File(["x"], "probe.jpg", { type: "image/jpeg" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

/**
 * Intenta compartir el archivo. Si no hay Web Share con files, descarga.
 * @returns "shared" | "downloaded" | "cancelled"
 */
export async function shareOrDownloadBlob(
  blob: Blob,
  filename: string,
  title: string,
): Promise<"shared" | "downloaded" | "cancelled"> {
  if (canShareFiles()) {
    try {
      const file = new File([blob], filename, { type: "image/jpeg" });
      await navigator.share({
        files: [file],
        title,
        text: title,
      });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // Fallback a descarga si share falla por otro motivo.
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
}
