import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { lempiras } from "@/lib/format";
import type { Venta } from "@/lib/types";

export function VentaDetalle({ venta, tasaIsv = 0.15 }: { venta: Pick<Venta, "detalles" | "subtotal" | "igv" | "total">; tasaIsv?: number }) {
  return (
    <div className="grid gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cant.</TableHead>
            <TableHead className="text-right">P. unit.</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venta.detalles.map((d, i) => (
            <TableRow key={d.id ?? i}>
              <TableCell className="whitespace-normal">{d.descripcion}</TableCell>
              <TableCell className="text-right tabular-nums">{d.cantidad}</TableCell>
              <TableCell className="text-right tabular-nums">{lempiras(d.precioUnitario)}</TableCell>
              <TableCell className="text-right tabular-nums">{lempiras(d.subtotal)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="grid gap-1 text-sm">
        <Fila label="Subtotal" valor={lempiras(venta.subtotal)} />
        <Fila label={`ISV (${Math.round(tasaIsv * 100)} %)`} valor={lempiras(venta.igv)} />
        <Separator className="my-1" />
        <Fila label="Total" valor={lempiras(venta.total)} fuerte />
      </div>
    </div>
  );
}

function Fila({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={`flex justify-between ${fuerte ? "text-base font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="tabular-nums text-foreground">{valor}</span>
    </div>
  );
}
