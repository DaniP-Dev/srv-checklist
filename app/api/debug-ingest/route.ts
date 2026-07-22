import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const LOG_PATH = path.join(process.cwd(), ".cursor", "debug-d38ce1.log");
const INGEST =
  "http://127.0.0.1:7464/ingest/a5382fd7-965e-4d66-b421-7cd1ddd3dfd1";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const line = `${JSON.stringify(payload)}\n`;
    await mkdir(path.dirname(LOG_PATH), { recursive: true });
    await appendFile(LOG_PATH, line, "utf8");
    // Best-effort forward to debug ingest (same machine as Next).
    fetch(INGEST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "d38ce1",
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
