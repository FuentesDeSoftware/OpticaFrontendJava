"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, ClipboardList, Glasses } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { MedicionResumen, MedicionTabla } from "@/components/medicion-tabla";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { lempiras } from "@/lib/format";
import type { Apartado, Cliente, Medicion } from "@/lib/types";
import { useData } from "@/lib/use-data";

export default function ClienteInicio() {
  const perfil = useData<Cliente>("/cliente/perfil");
  const mediciones = useData<Medicion[]>("/cliente/mediciones");
  const apartados = useData<Apartado[]>("/cliente/apartados");

  const ultima = mediciones.data?.[0];
  const pendientes = apartados.data?.filter((a) => a.estado === "PENDIENTE") ?? [];

  return (
    <>
      <PageHeader
        title={perfil.data ? `Hola, ${perfil.data.nombres}` : "Bienvenido"}
        description="Este es el resumen de tu cuenta."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-4 text-primary" /> Última medición
            </CardTitle>
            <CardDescription>Tu receta oftalmológica más reciente.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {mediciones.cargando ? (
              <Skeleton className="h-28" />
            ) : ultima ? (
              <>
                <MedicionResumen m={ultima} />
                <MedicionTabla m={ultima} />
                <Button asChild variant="link" className="justify-self-start px-0">
                  <Link href="/cliente/mediciones">
                    Ver historial completo <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no tienes mediciones registradas. Acércate a la óptica para tu evaluación.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="size-4 text-primary" /> Aros apartados
            </CardTitle>
            <CardDescription>Modelos reservados para tu cotización.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {apartados.cargando ? (
              <Skeleton className="h-20" />
            ) : pendientes.length ? (
              pendientes.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span>{a.aro.marca} {a.aro.modelo}</span>
                  <span className="font-medium">{lempiras(a.aro.precio)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tienes aros apartados.</p>
            )}
            <Button asChild className="mt-2">
              <Link href="/cliente/catalogo">
                <Glasses className="size-4" /> Explorar catálogo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
