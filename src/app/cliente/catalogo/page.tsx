"use client";

import { useMemo, useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, Glasses, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { apartarAro } from "@/app/actions/cliente";
import { EmptyState, PageHeader } from "@/components/app-shell";
import { AroCard } from "@/components/aro-card";
import { FiltroSelect } from "@/components/filtro-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { query } from "@/lib/api";
import type { Apartado, Aro, FiltrosCatalogo } from "@/lib/types";
import { useData } from "@/lib/use-data";
import { useDebouncedCallback } from "@/lib/use-debounce";

const vacio = { marca: "", material: "", forma: "", precioMin: "", precioMax: "" };

export default function Catalogo() {
  const [filtros, setFiltros] = useState(vacio);
  const [precios, setPrecios] = useState({ precioMin: "", precioMax: "" });
  const opciones = useData<FiltrosCatalogo>("/catalogo/filtros");
  const apartados = useData<Apartado[]>("/cliente/apartados");
  const aros = useData<Aro[]>(`/catalogo/aros${query(filtros)}`, { mantener: true });
  const [apartando, setApartando] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Los precios se aplican tras una breve pausa al escribir
  const [aplicarPrecios, cancelarPrecios] = useDebouncedCallback(setFiltros, 400);
  function cambiarPrecio(k: keyof typeof precios, v: string) {
    const siguiente = { ...precios, [k]: v };
    setPrecios(siguiente);
    aplicarPrecios((f) => ({ ...f, ...siguiente }));
  }

  const pendientes = useMemo(
    () => new Set(apartados.data?.filter((a) => a.estado === "PENDIENTE").map((a) => a.aroId)),
    [apartados.data],
  );

  function apartar(aro: Aro) {
    setApartando(aro.id);
    startTransition(async () => {
      const r = await apartarAro(aro.id);
      if (r.ok) {
        toast.success(`Apartaste ${aro.marca} ${aro.modelo}`, {
          description: "Un vendedor lo tendrá en cuenta para tu cotización.",
        });
        await apartados.recargar();
      } else {
        toast.error(r.mensaje);
      }
      setApartando(null);
    });
  }

  const set = (k: keyof typeof vacio) => (v: string) => setFiltros((f) => ({ ...f, [k]: v }));
  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <>
      <PageHeader title="Catálogo de aros" description="Encuentra el aro ideal y apártalo para tu próxima compra." />

      <div className="mb-6 grid gap-3 rounded-xl border bg-background p-4 sm:grid-cols-2 lg:grid-cols-6">
        <FiltroSelect label="Marca" value={filtros.marca} opciones={opciones.data?.marcas ?? []} onChange={set("marca")} />
        <FiltroSelect label="Material" value={filtros.material} opciones={opciones.data?.materiales ?? []} onChange={set("material")} />
        <FiltroSelect label="Forma" value={filtros.forma} opciones={opciones.data?.formas ?? []} onChange={set("forma")} />
        <div className="grid gap-1.5">
          <Label htmlFor="precioMin">Precio mín. (Lps)</Label>
          <Input id="precioMin" type="number" min={0} inputMode="decimal" value={precios.precioMin}
                 onChange={(e) => cambiarPrecio("precioMin", e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="precioMax">Precio máx. (Lps)</Label>
          <Input id="precioMax" type="number" min={0} inputMode="decimal" value={precios.precioMax}
                 onChange={(e) => cambiarPrecio("precioMax", e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="outline" className="w-full" disabled={!hayFiltros}
                  onClick={() => { cancelarPrecios(); setFiltros(vacio); setPrecios({ precioMin: "", precioMax: "" }); }}>
            <RotateCcw className="size-4" /> Limpiar
          </Button>
        </div>
      </div>

      {aros.error && <p className="mb-4 text-sm text-destructive">{aros.error}</p>}

      {aros.cargando && !aros.data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : aros.data?.length ? (
        <>
          <p className="mb-3 text-sm text-muted-foreground">{aros.data.length} modelos encontrados</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {aros.data.map((aro) => {
              const yaApartado = pendientes.has(aro.id);
              return (
                <AroCard key={aro.id} aro={aro}>
                  <Button size="sm" variant={yaApartado ? "secondary" : "default"}
                          disabled={yaApartado || apartando === aro.id} onClick={() => apartar(aro)}>
                    {yaApartado ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                    {yaApartado ? "Apartado" : "Apartar"}
                  </Button>
                </AroCard>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState icon={Glasses} title="No hay aros con esos filtros">
          Prueba con otra combinación o limpia los filtros.
        </EmptyState>
      )}
    </>
  );
}
