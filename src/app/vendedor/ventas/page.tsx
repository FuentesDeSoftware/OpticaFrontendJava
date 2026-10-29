"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Receipt, ShoppingCart } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app-shell";
import { VentaDetalle } from "@/components/venta-detalle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fechaHora, soles } from "@/lib/format";
import type { Venta } from "@/lib/types";
import { useData } from "@/lib/use-data";

export default function Ventas() {
  const { data, cargando } = useData<Venta[]>("/vendedor/ventas");
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const detalle = useData<Venta>(seleccion ? `/vendedor/ventas/${seleccion}` : null);

  return (
    <>
      <PageHeader
        title="Ventas"
        description="Historial de ventas registradas."
        actions={<Button asChild><Link href="/vendedor/ventas/nueva"><ShoppingCart className="size-4" /> Nueva venta</Link></Button>}
      />
      {cargando ? <Skeleton className="h-60" /> : data?.length ? (
        <div className="overflow-x-auto rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N.º</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">IGV</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">#{v.id}</TableCell>
                  <TableCell>{fechaHora(v.fecha)}</TableCell>
                  <TableCell className="font-medium">{v.clienteNombre}</TableCell>
                  <TableCell className="text-muted-foreground">{v.vendedorNombre}</TableCell>
                  <TableCell className="text-right tabular-nums">{soles(v.subtotal)}</TableCell>
                  <TableCell className="text-right tabular-nums">{soles(v.igv)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{soles(v.total)}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" aria-label="Ver detalle" onClick={() => setSeleccion(v.id)}>
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Receipt} title="Aún no hay ventas registradas" />
      )}

      <Dialog open={seleccion !== null} onOpenChange={(o) => !o && setSeleccion(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Venta #{seleccion}</DialogTitle>
            <DialogDescription>
              {detalle.data ? `${detalle.data.clienteNombre} · ${fechaHora(detalle.data.fecha)}` : "Cargando…"}
            </DialogDescription>
          </DialogHeader>
          {detalle.data && detalle.data.id === seleccion ? <VentaDetalle venta={detalle.data} /> : <Skeleton className="h-40" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
