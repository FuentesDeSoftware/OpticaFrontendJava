import "server-only";
import { decodeJwt } from "jose";
import type { Rol, Sesion } from "./types";

export const COOKIE_TOKEN = "optica_token";

export const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");

/**
 * Lee los datos del JWT sin verificar la firma: la firma la valida el backend en
 * cada petición. Aquí solo se usa para decidir a qué interfaz redirigir.
 */
export function leerSesion(token: string | undefined): Sesion | null {
  if (!token) return null;
  try {
    const claims = decodeJwt(token);
    if (!claims.exp || claims.exp * 1000 < Date.now()) return null;
    const rol = claims.rol as Rol;
    if (rol !== "CLIENTE" && rol !== "VENDEDOR") return null;
    return { rol, nombre: String(claims.nombre ?? ""), email: String(claims.sub ?? "") };
  } catch {
    return null;
  }
}

export function inicioPorRol(rol: Rol): string {
  return rol === "VENDEDOR" ? "/vendedor" : "/cliente";
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};
