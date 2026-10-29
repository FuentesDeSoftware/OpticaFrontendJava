"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, PackageCheck, Receipt, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { StockBadge } from "@/components/stock-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fechaHora, soles } from "@/lib/format";
import type { AlertasStock, Venta } from "@/lib/types";
import { useData } from "@/lib/use-data";

export default function PanelVendedor() {
  const alertas = useData<AlertasStock>("/vendedor/alertas-stock");
  const ventas = useData<Venta[]>("/vendedor/ventas");

  const filasAlerta = alertas.data
    ? [
        ...alertas.data.aros.map((p) => ({ key: `a${p.id}`, tipo: "Aro", nombre: p.etiqueta, codigo: p.codigo, stock: p.stock })),
        ...alertas.data.lunas.map((p) => ({ key: `l${p.id}`, tipo: "Luna", nombre: p.etiqueta, codigo: p.codigo, stock: p.stock })),
        ...alertas.data.accesorios.map((p) => ({ key: `c${p.id}`, tipo: "Accesorio", nombre: p.etiqueta, codigo: p.codigo, stock: p.stock })),
      ]
    : [];
  const arosBajos = alertas.data?.aros.length ?? 0;

  const ventasHoy = ventas.data ? ventasDeHoy(ventas.data) : [];
  const totalHoy = ventasHoy.reduce((s, v) => s + Number(v.total), 0);

  return (
    <>
      <PageHeader
        title="Panel del vendedor"
        description="Resumen del inventario y de las ventas."
        actions={
          <Button asChild>
            <Link href="/vendedor/ventas/nueva"><ShoppingCart className="size-4" /> Nueva venta</Link>
          </Button>
        }
      />

      {arosBajos > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="size-4" />
          <AlertTitle>Stock bajo en {arosBajos} {arosBajos === 1 ? "modelo de aro" : "modelos de aro"}</AlertTitle>
          <AlertDescription>
            Hay aros con menos de {alertas.data?.umbral} unidades. Revisa el inventario y programa la reposición.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Kpi icon={Receipt} label="Ventas de hoy" valor={ventas.cargando ? null : String(ventasHoy.length)} />
        <Kpi icon={PackageCheck} label="Ingresos de hoy" valor={ventas.cargando ? null : soles(totalHoy)} />
        <Kpi icon={Boxes} label="Productos con stock bajo" valor={alertas.cargando ? null : String(filasAlerta.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" /> Alertas de stock
            </CardTitle>
            <CardDescription>Productos con menos de {alertas.data?.umbral ?? 5} unidades.</CardDescription>
          </CardHeader>
          <CardContent>
            {alertas.cargando ? <Skeleton className="h-40" /> : filasAlerta.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filasAlerta.map((f) => (
                    <TableRow key={f.key}>
                      <TableCell>
                        <p className="font-medium">{f.nombre}</p>
                        <p className="text-xs text-muted-foreground">{f.codigo}</p>
                      </TableCell>
                      <TableCell>{f.tipo}</TableCell>
                      <TableCell className="text-right"><StockBadge stock={f.stock} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Todo el inventario tiene stock suficiente.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-4 text-primary" /> Últimas ventas
            </CardTitle>
            <CardDescription>Las cinco ventas más recientes.</CardDescription>
          </CardHeader>
          <CardContent>
            {ventas.cargando ? <Skeleton className="h-40" /> : ventas.data?.length ? (
              <div className="grid gap-2">
                {ventas.data.slice(0, 5).map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{v.clienteNombre}</p>
                      <p className="text-xs text-muted-foreground">#{v.id} · {fechaHora(v.fecha)}</p>
                    </div>
                    <span className="font-semibold">{soles(v.total)}</span>
                  </div>
                ))}
                <Button asChild variant="link" className="justify-self-start px-0">
                  <Link href="/vendedor/ventas">Ver todas <ArrowRight className="size-4" /></Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no se registran ventas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/** Solo se evalúa en el navegador, cuando ya llegaron los datos. */
function ventasDeHoy(ventas: Venta[]) {
  const hoy = new Date().toDateString();
  return ventas.filter((v) => v.fecha && new Date(v.fecha).toDateString() === hoy);
}

function Kpi({ icon: Icon, label, valor }: { icon: typeof Receipt; label: string; valor: string | null }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {valor === null ? <Skeleton className="mt-1 h-6 w-16" /> : <p className="text-xl font-semibold">{valor}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
