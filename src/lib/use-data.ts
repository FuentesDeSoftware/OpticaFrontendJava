"use client";

import { useCallback, useEffect, useState } from "react";
import { api, mensajeDeError } from "./api";

interface Estado<T> {
  ruta: string | null;
  data: T | null;
  error: string | null;
}

/**
 * Carga datos del backend cada vez que cambia la ruta y expone recargar()
 * para refrescar tras una mutación. Con `mantener` se conservan los datos
 * anteriores mientras llega la nueva respuesta (útil para filtros).
 */
export function useData<T>(ruta: string | null, { mantener = false } = {}) {
  const [estado, setEstado] = useState<Estado<T>>({ ruta: null, data: null, error: null });

  useEffect(() => {
    if (ruta === null) return;
    let vigente = true;
    api<T>(ruta)
      .then((data) => vigente && setEstado({ ruta, data, error: null }))
      .catch((e) => vigente && setEstado((prev) => ({ ruta, data: prev.data, error: mensajeDeError(e) })));
    return () => {
      vigente = false;
    };
  }, [ruta]);

  const recargar = useCallback(async () => {
    if (ruta === null) return;
    try {
      setEstado({ ruta, data: await api<T>(ruta), error: null });
    } catch (e) {
      setEstado((prev) => ({ ...prev, error: mensajeDeError(e) }));
    }
  }, [ruta]);

  const actual = ruta !== null && estado.ruta === ruta;
  return {
    data: actual || (mantener && ruta !== null) ? estado.data : null,
    error: actual ? estado.error : null,
    cargando: ruta !== null && !actual,
    recargar,
  };
}
