"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bookmark, X } from "lucide-react";
import { toast } from "sonner";
import { cancelarApartado } from "@/app/actions/cliente";
import { EmptyState, PageHeader } from "@/components/app-shell";
import { AroCard } from "@/components/aro-card";
import { ConfirmButton } from "@/components/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fecha } from "@/lib/format";
import type { Apartado, EstadoApartado } from "@/lib/types";
import { useData } from "@/lib/use-data";

const estadoBadge: Record<EstadoApartado, { label: string; variant: "default" | "secondary" | "outline" }> = {
  PENDIENTE: { label: "Pendiente", variant: "default" },
  VENDIDO: { label: "Comprado", variant: "secondary" },
  CANCELADO: { label: "Cancelado", variant: "outline" },
};

export default function MisApartados() {
  const { data, cargando, recargar } = useData<Apartado[]>("/cliente/apartados");
  const [, startTransition] = useTransition();

  function cancelar(a: Apartado) {
    startTransition(async () => {
      const r = await cancelarApartado(a.id);
      if (r.ok) {
        toast.success("Apartado cancelado");
        await recargar();
      } else {
        toast.error(r.mensaje);
      }
    });
  }

  return (
    <>
      <PageHeader title="Mis apartados" description="Aros que guardaste para tu cotización o compra." />
      {cargando ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" /><Skeleton className="h-72" />
        </div>
      ) : data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((a) => (
            <div key={a.id} className="relative">
              <Badge variant={estadoBadge[a.estado].variant} className="absolute left-3 top-3 z-10">
                {estadoBadge[a.estado].label}
              </Badge>
              <AroCard aro={a.aro}>
                {a.estado === "PENDIENTE" ? (
                  <ConfirmButton
                    title="¿Cancelar este apartado?"
                    description={`${a.aro.marca} ${a.aro.modelo} dejará de estar reservado para ti.`}
                    confirmLabel="Cancelar apartado"
                    onConfirm={() => cancelar(a)}
                  >
                    <Button size="sm" variant="outline"><X className="size-4" /> Cancelar</Button>
                  </ConfirmButton>
                ) : (
                  <span className="text-xs text-muted-foreground">{fecha(a.fecha)}</span>
                )}
              </AroCard>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Bookmark} title="No tienes aros apartados">
          <Button asChild variant="link" className="px-0">
            <Link href="/cliente/catalogo">Ir al catálogo</Link>
          </Button>
        </EmptyState>
      )}
    </>
  );
}
