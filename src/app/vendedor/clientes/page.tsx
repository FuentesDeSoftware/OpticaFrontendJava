"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Plus, ShoppingCart, Users } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app-shell";
import { ClienteBuscador } from "@/components/cliente-buscador";
import { MedicionForm } from "@/components/medicion-form";
import { MedicionResumen, MedicionTabla } from "@/components/medicion-tabla";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { lempiras } from "@/lib/format";
import type { Apartado, Cliente, Medicion } from "@/lib/types";
import { useData } from "@/lib/use-data";

export default function Clientes() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const mediciones = useData<Medicion[]>(cliente ? `/vendedor/clientes/${cliente.id}/mediciones` : null);
  const apartados = useData<Apartado[]>(cliente ? `/vendedor/clientes/${cliente.id}/apartados` : null);
  const pendientes = apartados.data?.filter((a) => a.estado === "PENDIENTE") ?? [];

  return (
    <>
      <PageHeader title="Clientes" description="Consulta clientes y registra sus mediciones oftalmológicas." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Buscar cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ClienteBuscador seleccionado={cliente?.id} onSelect={setCliente} />
          </CardContent>
        </Card>

        {!cliente ? (
          <EmptyState icon={Users} title="Selecciona un cliente">
            Busca por DNI o nombre para ver sus mediciones y apartados.
          </EmptyState>
        ) : (
          <div className="grid gap-4">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{cliente.nombreCompleto}</CardTitle>
                  <CardDescription>
                    DNI {cliente.dni} · {cliente.telefono ?? "sin teléfono"} · {cliente.email}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setFormAbierto(true)}>
                    <Plus className="size-4" /> Nueva medición
                  </Button>
                  <Button asChild>
                    <Link href={`/vendedor/ventas/nueva?cliente=${cliente.id}`}>
                      <ShoppingCart className="size-4" /> Vender
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              {pendientes.length > 0 && (
                <CardContent className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Aros apartados:</span>
                  {pendientes.map((a) => (
                    <Badge key={a.id} variant="secondary">{a.aro.marca} {a.aro.modelo} · {lempiras(a.aro.precio)}</Badge>
                  ))}
                </CardContent>
              )}
            </Card>

            <div>
              <h2 className="mb-3 flex items-center gap-2 font-medium">
                <ClipboardList className="size-4 text-primary" /> Historial de mediciones
              </h2>
              {mediciones.cargando ? (
                <Skeleton className="h-40" />
              ) : mediciones.data?.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {mediciones.data.map((m, i) => (
                    <Card key={m.id}>
                      <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <MedicionResumen m={m} />
                        {i === 0 && <Badge>Vigente</Badge>}
                      </CardHeader>
                      <CardContent><MedicionTabla m={m} /></CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ClipboardList} title="Sin mediciones">Registra la primera medición del cliente.</EmptyState>
              )}
            </div>

            <MedicionForm
              cliente={cliente}
              open={formAbierto}
              onOpenChange={setFormAbierto}
              onCreada={() => void mediciones.recargar()}
            />
          </div>
        )}
      </div>
    </>
  );
}
