"use client";

import { useEffect, useRef } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import {
  clearDraft,
  loadDraft,
  saveDraft,
} from "@/lib/offline/drafts";
import type { InspectionFormType } from "@/lib/types/inspection";
import { useDebouncedCallback } from "@/hooks/use-online-status";

/**
 * Carga borrador al montar y guarda cambios con debounce.
 */
export function useFormDraft<T extends FieldValues>(
  tipo: InspectionFormType,
  form: UseFormReturn<T>,
  options?: {
    onDraftLoaded?: (values: T) => void;
    enabled?: boolean;
  },
) {
  const { reset, watch } = form;
  const loadedRef = useRef(false);
  const suppressSaveRef = useRef(false);
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled || loadedRef.current) return;
    let cancelled = false;

    void (async () => {
      try {
        const draft = await loadDraft<T>(tipo);
        if (cancelled || !draft) {
          loadedRef.current = true;
          return;
        }
        reset(draft);
        options?.onDraftLoaded?.(draft);
      } catch {
        // ignore
      } finally {
        if (!cancelled) loadedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
    // Solo al montar / cambiar tipo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, enabled]);

  const debouncedSave = useDebouncedCallback((values: T) => {
    if (!loadedRef.current || suppressSaveRef.current) return;
    void saveDraft(tipo, values);
  }, 800);

  useEffect(() => {
    if (!enabled) return;
    const subscription = watch((values) => {
      debouncedSave(values as T);
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedSave, enabled]);

  return {
    /** Borra el draft y evita que el reset posterior lo vuelva a guardar vacío. */
    clearCurrentDraft: async () => {
      suppressSaveRef.current = true;
      await clearDraft(tipo);
      window.setTimeout(() => {
        suppressSaveRef.current = false;
      }, 1200);
    },
  };
}
