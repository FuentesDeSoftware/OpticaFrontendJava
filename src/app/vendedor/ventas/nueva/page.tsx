import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { backend, ejecutar } from "@/lib/backend";
import type { Cliente } from "@/lib/types";
import { NuevaVenta } from "./nueva-venta";

export default function NuevaVentaPage({ searchParams }: PageProps<"/vendedor/ventas/nueva">) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ConClienteInicial searchParams={searchParams} />
    </Suspense>
  );
}

// Preselección desde /vendedor/clientes (?cliente=ID), resuelta en el servidor
async function ConClienteInicial({ searchParams }: Pick<PageProps<"/vendedor/ventas/nueva">, "searchParams">) {
  const { cliente } = await searchParams;
  const id = typeof cliente === "string" ? cliente : null;
  const r = id ? await ejecutar(() => backend<Cliente>(`/vendedor/clientes/${encodeURIComponent(id)}`)) : null;
  return <NuevaVenta clienteInicial={r?.ok ? r.data : null} />;
}
