"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BACKEND_URL, COOKIE_TOKEN, cookieOptions, inicioPorRol } from "@/lib/session";
import type { Sesion } from "@/lib/types";

export interface EstadoAuth {
  mensaje: string;
  errores: Record<string, string>;
  valores?: Record<string, string>;
}

/** Envía login/registro al backend y guarda el JWT en una cookie httpOnly. */
async function autenticar(endpoint: "login" | "registro", body: Record<string, string>): Promise<EstadoAuth> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { mensaje: "No se pudo conectar con el servidor", errores: {} };
  }

  const data = await res.json().catch(() => ({ mensaje: "Respuesta inválida del servidor" }));
  if (!res.ok) {
    return { mensaje: data.mensaje ?? "Ocurrió un error inesperado", errores: data.errores ?? {} };
  }

  const { token, ...sesion } = data as Sesion & { token: string };
  (await cookies()).set(COOKIE_TOKEN, token, cookieOptions);
  redirect(inicioPorRol(sesion.rol));
}

export async function login(_prev: EstadoAuth | null, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const estado = await autenticar("login", { email, password: String(formData.get("password") ?? "") });
  return { ...estado, mensaje: estado.mensaje || "No se pudo iniciar sesión", valores: { email } };
}

export async function registro(_prev: EstadoAuth | null, formData: FormData) {
  const { confirmar, ...body } = Object.fromEntries(formData) as Record<string, string>;
  // Se devuelven los valores (sin contraseñas) para no vaciar el formulario si hay error
  const { password, ...valores } = body;
  if (password !== confirmar) {
    return { mensaje: "", errores: { confirmar: "Las contraseñas no coinciden" }, valores };
  }
  const estado = await autenticar("registro", body);
  return { ...estado, mensaje: estado.mensaje || "No se pudo crear la cuenta", valores };
}

export async function logout() {
  (await cookies()).delete(COOKIE_TOKEN);
  redirect("/login");
}
