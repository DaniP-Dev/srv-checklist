"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";

export interface SignaturePadHandle {
  getDataURL: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  label: string;
  onChange?: (dataUrl: string | null) => void;
}

const MOBILE_HEIGHT = 160;
const TABLET_HEIGHT = 220;

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ label, onChange }, ref) {
    const canvasRef = useRef<SignatureCanvas | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [ready, setReady] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [height, setHeight] = useState(MOBILE_HEIGHT);

    const updateHeight = useCallback(() => {
      const next =
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 768px)").matches
          ? TABLET_HEIGHT
          : MOBILE_HEIGHT;
      setHeight(next);
    }, []);

    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = container.offsetWidth;
      const sigCanvas = canvas.getCanvas();
      const data = canvas.isEmpty() ? null : canvas.toDataURL("image/png");

      sigCanvas.width = width * ratio;
      sigCanvas.height = height * ratio;
      sigCanvas.style.width = `${width}px`;
      sigCanvas.style.height = `${height}px`;
      sigCanvas.style.touchAction = "none";

      const ctx = sigCanvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
      }

      if (data) {
        canvas.fromDataURL(data);
        setIsEmpty(false);
      }
    }, [height]);

    useEffect(() => {
      setReady(true);
      updateHeight();
    }, [updateHeight]);

    useEffect(() => {
      if (!ready) return;
      resizeCanvas();

      const media = window.matchMedia("(min-width: 768px)");
      const onMedia = () => updateHeight();
      media.addEventListener("change", onMedia);
      window.addEventListener("resize", resizeCanvas);

      return () => {
        media.removeEventListener("change", onMedia);
        window.removeEventListener("resize", resizeCanvas);
      };
    }, [ready, resizeCanvas, updateHeight]);

    useImperativeHandle(ref, () => ({
      getDataURL: () => {
        if (!canvasRef.current || canvasRef.current.isEmpty()) return null;
        return canvasRef.current.toDataURL("image/png");
      },
      clear: () => {
        canvasRef.current?.clear();
        setIsEmpty(true);
        onChange?.(null);
      },
      isEmpty: () => canvasRef.current?.isEmpty() ?? true,
    }));

    function handleEnd() {
      if (!canvasRef.current || canvasRef.current.isEmpty()) {
        setIsEmpty(true);
        onChange?.(null);
        return;
      }
      setIsEmpty(false);
      onChange?.(canvasRef.current.toDataURL("image/png"));
    }

    return (
      <div className="w-full">
        <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-white touch-none"
          style={{ touchAction: "none" }}
        >
          {isEmpty ? (
            <p
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center text-base font-medium text-muted/50"
              aria-hidden
            >
              Firme aquí
            </p>
          ) : null}
          {ready ? (
            <SignatureCanvas
              ref={canvasRef}
              penColor="#1a2332"
              backgroundColor="#ffffff"
              minWidth={1.2}
              maxWidth={3.2}
              canvasProps={{
                className: "relative z-20 w-full block touch-none",
                style: {
                  width: "100%",
                  height,
                  touchAction: "none",
                },
              }}
              onBegin={() => setIsEmpty(false)}
              onEnd={handleEnd}
            />
          ) : (
            <div style={{ height }} className="bg-white" />
          )}
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            className="min-h-12 px-4"
            onClick={() => {
              canvasRef.current?.clear();
              setIsEmpty(true);
              onChange?.(null);
            }}
          >
            Limpiar firma
          </Button>
        </div>
      </div>
    );
  },
);
