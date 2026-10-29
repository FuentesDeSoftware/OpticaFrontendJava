import "server-only";
import { NextResponse } from "next/server";
import { BACKEND_URL, COOKIE_TOKEN, cookieOptions } from "./session";

/** Reenvía login/registro al backend y guarda el JWT en una cookie httpOnly. */
export async function autenticar(request: Request, endpoint: "login" | "registro") {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con el servidor" }, { status: 502 });
  }

  const data = await res.json().catch(() => ({ mensaje: "Respuesta inválida del servidor" }));
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const { token, ...sesion } = data;
  const response = NextResponse.json(sesion, { status: res.status });
  response.cookies.set(COOKIE_TOKEN, token, cookieOptions);
  return response;
}
