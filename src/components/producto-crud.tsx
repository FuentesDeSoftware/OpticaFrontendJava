"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { StockBadge } from "@/components/stock-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, mensajeDeError } from "@/lib/api";
import { soles } from "@/lib/format";
import { useData } from "@/lib/use-data";
import { cn } from "@/lib/utils";

export interface Campo {
  name: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: string[];
  step?: string;
  required?: boolean;
  full?: boolean;
}

export interface Columna<T> {
  header: string;
  cell: (row: T) => ReactNode;
}

interface ProductoBase {
  id: number;
  codigo: string;
  precio: number;
  stock: number;
  etiqueta: string;
}

/**
 * CRUD genérico para aros, lunas y accesorios sobre /vendedor/{recurso}.
 * Código, precio y stock son comunes; el resto de campos se configura por tipo.
 */
export function ProductoCrud<T extends ProductoBase>({
  recurso,
  singular,
  campos,
  columnas,
}: {
  recurso: "aros" | "lunas" | "accesorios";
  singular: string;
  campos: Campo[];
  columnas: Columna<T>[];
}) {
  const { data, cargando, error, recargar } = useData<T[]>(`/vendedor/${recurso}`);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<T | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const todosLosCampos: Campo[] = [
    { name: "codigo", label: "Código", required: true },
    ...campos,
    { name: "precio", label: "Precio (S/)", type: "number", step: "0.01", required: true },
    { name: "stock", label: "Stock", type: "number", step: "1", required: true },
  ];

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((p) => `${p.codigo} ${p.etiqueta}`.toLowerCase().includes(q));
  }, [data, busqueda]);

  function abrir(producto: T | null) {
    setEditando(producto);
    setErrores({});
    setAbierto(true);
  }

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    for (const c of todosLosCampos) {
      const v = String(form.get(c.name) ?? "").trim();
      body[c.name] = c.type === "number" ? (v === "" ? null : Number(v)) : v || null;
    }
    setGuardando(true);
    try {
      if (editando) {
        await api(`/vendedor/${recurso}/${editando.id}`, { method: "PUT", body });
        toast.success(`${singular} actualizado`);
      } else {
        await api(`/vendedor/${recurso}`, { method: "POST", body });
        toast.success(`${singular} creado`);
      }
      setAbierto(false);
      await recargar();
    } catch (err) {
      const errs = (err as { errores?: Record<string, string> }).errores ?? {};
      setErrores(errs);
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(p: T) {
    try {
      await api(`/vendedor/${recurso}/${p.id}`, { method: "DELETE" });
      toast.success(`${singular} eliminado`);
      await recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  const valorInicial = (name: string) => {
    const v = editando ? (editando as unknown as Record<string, unknown>)[name] : undefined;
    return v === null || v === undefined ? "" : String(v);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Buscar por código o nombre" value={busqueda}
                 onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <Button onClick={() => abrir(null)}><Plus className="size-4" /> Nuevo {singular.toLowerCase()}</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              {columnas.map((c) => <TableHead key={c.header}>{c.header}</TableHead>)}
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando && !data ? (
              <TableRow><TableCell colSpan={columnas.length + 4}><Skeleton className="h-24" /></TableCell></TableRow>
            ) : filtrados.length ? (
              filtrados.map((p) => (
                <TableRow key={p.id} className={cn(p.stock < 5 && "bg-destructive/5")}>
                  <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
                  {columnas.map((c) => <TableCell key={c.header}>{c.cell(p)}</TableCell>)}
                  <TableCell className="text-right tabular-nums">{soles(p.precio)}</TableCell>
                  <TableCell className="text-right"><StockBadge stock={p.stock} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => abrir(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmButton
                        title={`¿Eliminar ${p.etiqueta}?`}
                        description="El producto dejará de aparecer en el inventario y el catálogo. Las ventas anteriores se conservan."
                        confirmLabel="Eliminar"
                        onConfirm={() => eliminar(p)}
                      >
                        <Button size="icon" variant="ghost" aria-label="Eliminar">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </ConfirmButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnas.length + 4} className="py-10 text-center text-muted-foreground">
                  No hay productos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar ${singular.toLowerCase()}` : `Nuevo ${singular.toLowerCase()}`}</DialogTitle>
            <DialogDescription>Los campos marcados con * son obligatorios.</DialogDescription>
          </DialogHeader>
          <form key={editando?.id ?? "nuevo"} onSubmit={guardar} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {todosLosCampos.map((c) => (
                <div key={c.name} className={cn("grid gap-1.5", c.full && "sm:col-span-2")}>
                  <Label htmlFor={c.name}>{c.label}{c.required && " *"}</Label>
                  {c.type === "select" ? (
                    <Select name={c.name} defaultValue={valorInicial(c.name) || c.options?.[0]}>
                      <SelectTrigger id={c.name} className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {c.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id={c.name} name={c.name} type={c.type ?? "text"} step={c.step} min={c.type === "number" ? 0 : undefined}
                           required={c.required} defaultValue={valorInicial(c.name)} aria-invalid={!!errores[c.name] || undefined} />
                  )}
                  {errores[c.name] && <p className="text-xs text-destructive">{errores[c.name]}</p>}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAbierto(false)}>Cancelar</Button>
              <Button type="submit" disabled={guardando}>
                {guardando && <Loader2 className="size-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
