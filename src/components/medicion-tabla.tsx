import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dioptria, fecha } from "@/lib/format";
import type { Medicion } from "@/lib/types";

/** Receta en formato clínico: una fila por ojo (OD derecho / OI izquierdo). */
export function MedicionTabla({ m }: { m: Medicion }) {
  const filas = [
    { ojo: "OD", esf: m.odEsfera, cil: m.odCilindro, eje: m.odEje, add: m.odAdicion },
    { ojo: "OI", esf: m.oiEsfera, cil: m.oiCilindro, eje: m.oiEje, add: m.oiAdicion },
  ];
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Ojo</TableHead>
            <TableHead className="text-right">Esfera</TableHead>
            <TableHead className="text-right">Cilindro</TableHead>
            <TableHead className="text-right">Eje</TableHead>
            <TableHead className="text-right">Adición</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-mono tabular-nums">
          {filas.map((f) => (
            <TableRow key={f.ojo}>
              <TableCell className="font-sans font-medium">{f.ojo}</TableCell>
              <TableCell className="text-right">{dioptria(f.esf)}</TableCell>
              <TableCell className="text-right">{dioptria(f.cil)}</TableCell>
              <TableCell className="text-right">{f.eje}°</TableCell>
              <TableCell className="text-right">{dioptria(f.add)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function MedicionResumen({ m }: { m: Medicion }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{fecha(m.fecha)}</span>
      {m.dip && <span>DIP {m.dip} mm</span>}
      {m.observaciones && <span className="italic">{m.observaciones}</span>}
    </div>
  );
}
