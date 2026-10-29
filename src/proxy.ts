import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_TOKEN, inicioPorRol, leerSesion } from "@/lib/session";

/** Control de acceso por rol: redirige a cada usuario a su interfaz. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sesion = leerSesion(request.cookies.get(COOKIE_TOKEN)?.value);
  const esPublica = pathname === "/" || pathname === "/login" || pathname === "/registro";

  if (!sesion) {
    if (esPublica) return NextResponse.next();
    const login = new URL("/login", request.url);
    const response = NextResponse.redirect(login);
    response.cookies.delete(COOKIE_TOKEN);
    return response;
  }

  const inicio = inicioPorRol(sesion.rol);
  if (esPublica || !pathname.startsWith(inicio)) {
    return NextResponse.redirect(new URL(inicio, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/registro", "/cliente/:path*", "/vendedor/:path*"],
};
