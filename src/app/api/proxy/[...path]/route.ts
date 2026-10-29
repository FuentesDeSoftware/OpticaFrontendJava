import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { BACKEND_URL, COOKIE_TOKEN } from "@/lib/session";

/**
 * Reenvía /api/proxy/<ruta> a <BACKEND_URL>/api/<ruta> añadiendo el JWT de la cookie.
 * Así el navegador nunca ve el token y no hace falta CORS.
 */
async function reenviar(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  const { path } = await ctx.params;
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  const url = `${BACKEND_URL}/api/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;

  const headers: HeadersInit = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const tieneCuerpo = request.method !== "GET" && request.method !== "DELETE";
  if (tieneCuerpo) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(url, {
      method: request.method,
      headers,
      body: tieneCuerpo ? await request.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con el servidor" }, { status: 502 });
  }

  const cuerpo = res.status === 204 ? null : await res.text();
  const response = new NextResponse(cuerpo, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
  if (res.status === 401) response.cookies.delete(COOKIE_TOKEN);
  return response;
}

export { reenviar as GET, reenviar as POST, reenviar as PUT, reenviar as DELETE };
