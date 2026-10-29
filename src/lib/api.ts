export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errores: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Llama al backend a través del proxy de Next (/api/proxy/...). */
export async function api<T>(ruta: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/proxy${ruta}`, {
    method: init.method ?? "GET",
    headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 401) {
    // Navegación completa a propósito: descarta todo el estado del cliente
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
    throw new ApiError("Sesión expirada", 401);
  }
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.mensaje ?? "Ocurrió un error inesperado", res.status, data?.errores ?? {});
  }
  return data as T;
}

/** Construye un query string ignorando los valores vacíos. */
export function query(params: Record<string, string | number | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function mensajeDeError(e: unknown): string {
  return e instanceof Error ? e.message : "Ocurrió un error inesperado";
}
