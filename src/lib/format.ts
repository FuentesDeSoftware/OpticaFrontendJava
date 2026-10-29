const moneda = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function soles(valor: number | null | undefined): string {
  return moneda.format(Number(valor ?? 0));
}

export function fecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  // Las fechas sin hora (yyyy-MM-dd) se interpretan en hora local para no desfasar el día
  const d = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export function fechaHora(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

/** Dioptrías con signo explícito: +1.25 / -0.50 / 0.00 */
export function dioptria(valor: number | null | undefined): string {
  const n = Number(valor ?? 0);
  const s = Math.abs(n).toFixed(2);
  return n > 0 ? `+${s}` : n < 0 ? `-${s}` : s;
}
