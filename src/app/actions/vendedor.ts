"use server";

import { backend, ejecutar, exigirRol } from "@/lib/backend";
import type { Medicion, Venta } from "@/lib/types";

export interface VentaRequest {
  clienteId: number;
  medicionId: number;
  aroId: number;
  lunaId: number;
  accesorios: { accesorioId: number; cantidad: number }[];
}

type Recurso = "aros" | "lunas" | "accesorios";

export async function cotizarVenta(request: VentaRequest) {
  await exigirRol("VENDEDOR");
  return ejecutar(() => backend<Venta>("/vendedor/ventas/cotizar", { method: "POST", body: request }));
}

export async function registrarVenta(request: VentaRequest) {
  await exigirRol("VENDEDOR");
  return ejecutar(() => backend<Venta>("/vendedor/ventas", { method: "POST", body: request }));
}

export async function guardarProducto(recurso: Recurso, id: number | null, body: Record<string, unknown>) {
  await exigirRol("VENDEDOR");
  return ejecutar(() =>
    id === null
      ? backend<void>(`/vendedor/${recurso}`, { method: "POST", body })
      : backend<void>(`/vendedor/${recurso}/${id}`, { method: "PUT", body }),
  );
}

export async function eliminarProducto(recurso: Recurso, id: number) {
  await exigirRol("VENDEDOR");
  return ejecutar(() => backend<void>(`/vendedor/${recurso}/${id}`, { method: "DELETE" }));
}

const camposMedicion = ["odEsfera", "odCilindro", "odEje", "odAdicion", "oiEsfera", "oiCilindro", "oiEje", "oiAdicion"];

export async function crearMedicion(clienteId: number, formData: FormData) {
  await exigirRol("VENDEDOR");
  const body: Record<string, unknown> = {
    fecha: formData.get("fecha") || null,
    dip: formData.get("dip") ? Number(formData.get("dip")) : null,
    observaciones: String(formData.get("observaciones") ?? "").trim() || null,
  };
  for (const k of camposMedicion) body[k] = Number(formData.get(k) || 0);
  return ejecutar(() => backend<Medicion>(`/vendedor/clientes/${clienteId}/mediciones`, { method: "POST", body }));
}
