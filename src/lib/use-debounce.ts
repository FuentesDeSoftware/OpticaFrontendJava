"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Devuelve [debounced, cancel]: debounced solo ejecuta fn tras `ms` sin nuevas
 * llamadas. fn debe ser estable (p. ej. un setState).
 */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cancel = useCallback(() => clearTimeout(timer.current), []);
  const debounced = useCallback(
    (...args: A) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), ms);
    },
    [fn, ms],
  );

  // Solo limpia el timer al desmontar; no dispara renders
  useEffect(() => cancel, [cancel]);
  return [debounced, cancel] as const;
}
