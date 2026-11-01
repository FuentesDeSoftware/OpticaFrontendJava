"use server";

import { backend, ejecutar, exigirRol } from "@/lib/backend";
import type { Apartado } from "@/lib/types";

export async function apartarAro(aroId: number) {
  await exigirRol("CLIENTE");
  return ejecutar(() => backend<Apartado>("/cliente/apartados", { method: "POST", body: { aroId } }));
}

export async function cancelarApartado(id: number) {
  await exigirRol("CLIENTE");
  return ejecutar(() => backend<void>(`/cliente/apartados/${id}`, { method: "DELETE" }));
}
