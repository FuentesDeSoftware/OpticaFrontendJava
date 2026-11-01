import { Suspense } from "react";
import { sesionActual } from "@/lib/backend";

async function NombreUsuario() {
  return (await sesionActual())?.nombre ?? " ";
}

/** Nombre del usuario leído de la cookie en el servidor; el resto del shell se prerenderiza. */
export function UsuarioActual() {
  return (
    <Suspense fallback=" ">
      <NombreUsuario />
    </Suspense>
  );
}
