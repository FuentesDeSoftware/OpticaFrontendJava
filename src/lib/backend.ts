import "server-only";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { ApiError, mensajeDeError } from "./api";
import { BACKEND_URL, COOKIE_TOKEN, leerSesion } from "./session";
import type { Rol } from "./types";

export type Resultado<T> =
  | { ok: true; data: T }
  | { ok: false; mensaje: string; errores: Record<string, string> };

/** Llama al backend desde el servidor con el JWT de la cookie. */
export async function backend<T>(ruta: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const jar = await cookies();
  const token = jar.get(COOKIE_TOKEN)?.value;
  const headers: HeadersInit = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api${ruta}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 502);
  }

  if (res.status === 401) {
    // Las cookies solo se pueden modificar en Server Functions, no al renderizar
    try {
      jar.delete(COOKIE_TOKEN);
    } catch {}
    redirect("/login");
  }
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.mensaje ?? "Ocurrió un error inesperado", res.status, data?.errores ?? {});
  }
  return data as T;
}

/**
 * Convierte los errores en un resultado serializable: en producción Next oculta
 * el mensaje de los errores lanzados desde una Server Action.
 */
export async function ejecutar<T>(fn: () => Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    unstable_rethrow(e);
    return { ok: false, mensaje: mensajeDeError(e), errores: e instanceof ApiError ? e.errores : {} };
  }
}

export async function sesionActual() {
  // leerSesion usa Date.now(): debe ejecutarse en la petición, no en el prerender
  await connection();
  return leerSesion((await cookies()).get(COOKIE_TOKEN)?.value);
}

/** Las Server Actions aceptan POST directos: se comprueba el rol en cada una. */
export async function exigirRol(rol: Rol) {
  const sesion = await sesionActual();
  if (sesion?.rol !== rol) redirect("/login");
  return sesion;
}
