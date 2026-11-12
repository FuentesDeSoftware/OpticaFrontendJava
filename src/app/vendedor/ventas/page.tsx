"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, FileText, Receipt, ShoppingCart } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/app-shell";
import { BotonPdf } from "@/components/boton-pdf";
import { VentaDetalle } from "@/components/venta-detalle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { query } from "@/lib/api";
import { fechaHora, lempiras } from "@/lib/format";
import type { Venta } from "@/lib/types";
import { useData } from "@/lib/use-data";

export default function Ventas() {
  const { data, cargando } = useData<Venta[]>("/vendedor/ventas");
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const detalle = useData<Venta>(seleccion ? `/vendedor/ventas/${seleccion}` : null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const rangoValido = desde !== "" && hasta !== "" && desde <= hasta;

  return (
    <>
      <PageHeader
        title="Ventas"
        description="Historial de ventas registradas."
        actions={<Button asChild><Link href="/vendedor/ventas/nueva"><ShoppingCart className="size-4" /> Nueva venta</Link></Button>}
      />
      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border bg-background p-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Desde</span>
          <Input type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Hasta</span>
          <Input type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} />
        </label>
        {rangoValido ? (
          <BotonPdf ruta={`/vendedor/reportes/ventas${query({ desde, hasta })}`}>Reporte de ventas</BotonPdf>
        ) : (
          <Button variant="outline" disabled><FileText className="size-4" /> Reporte de ventas</Button>
        )}
      </div>
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
                <TableHead className="text-right">ISV</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">#{v.id}</TableCell>
                  <TableCell>{fechaHora(v.fecha)}</TableCell>
                  <TableCell className="font-medium">{v.clienteNombre}</TableCell>
                  <TableCell className="text-muted-foreground">{v.vendedorNombre}</TableCell>
                  <TableCell className="text-right tabular-nums">{lempiras(v.subtotal)}</TableCell>
                  <TableCell className="text-right tabular-nums">{lempiras(v.igv)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{lempiras(v.total)}</TableCell>
                  <TableCell>
                    <div className="flex">
                      <Button size="icon" variant="ghost" aria-label="Ver detalle" onClick={() => setSeleccion(v.id)}>
                        <Eye className="size-4" />
                      </Button>
                      <BotonPdf ruta={`/vendedor/reportes/ventas/${v.id}`} variant="ghost" size="icon" />
                    </div>
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
          {seleccion !== null && (
            <DialogFooter>
              <BotonPdf ruta={`/vendedor/reportes/ventas/${seleccion}`}>Imprimir comprobante</BotonPdf>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
