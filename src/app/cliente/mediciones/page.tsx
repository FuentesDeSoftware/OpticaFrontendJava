"use client";

import { ClipboardList } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app-shell";
import { MedicionResumen, MedicionTabla } from "@/components/medicion-tabla";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Medicion } from "@/lib/types";
import { useData } from "@/lib/use-data";

export default function MisMediciones() {
  const { data, error, cargando } = useData<Medicion[]>("/cliente/mediciones");

  return (
    <>
      <PageHeader
        title="Historial de mediciones"
        description="Esfera, cilindro, eje y adición de cada ojo. OD = ojo derecho · OI = ojo izquierdo."
      />
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {cargando ? (
        <div className="grid gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((m, i) => (
            <Card key={m.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <MedicionResumen m={m} />
                {i === 0 && <Badge>Vigente</Badge>}
              </CardHeader>
              <CardContent>
                <MedicionTabla m={m} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title="Sin mediciones registradas">
          Tus recetas aparecerán aquí cuando un especialista las registre.
        </EmptyState>
      )}
    </>
  );
}
