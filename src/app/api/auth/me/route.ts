import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_TOKEN, leerSesion } from "@/lib/session";

export async function GET() {
  const sesion = leerSesion((await cookies()).get(COOKIE_TOKEN)?.value);
  if (!sesion) {
    return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json(sesion);
}
