"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookmarkCheck, CheckCircle2, Loader2, Minus, Plus, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { ClienteBuscador } from "@/components/cliente-buscador";
import { MedicionResumen, MedicionTabla } from "@/components/medicion-tabla";
import { StockBadge } from "@/components/stock-badge";
import { VentaDetalle } from "@/components/venta-detalle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, mensajeDeError } from "@/lib/api";
import { soles } from "@/lib/format";
import type { Accesorio, Apartado, Aro, Cliente, Luna, Medicion, Venta } from "@/lib/types";
import { useData } from "@/lib/use-data";
import { cn } from "@/lib/utils";

export default function NuevaVenta() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [medicionElegida, setMedicionElegida] = useState<number | null>(null);
  const [aroId, setAroId] = useState<number | null>(null);
  const [lunaId, setLunaId] = useState<number | null>(null);
  const [accesorios, setAccesorios] = useState<Record<number, number>>({});
  const [busquedaAro, setBusquedaAro] = useState("");
  const [respuesta, setRespuesta] = useState<{ key: string; venta: Venta | null; error: string | null } | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [ventaRegistrada, setVentaRegistrada] = useState<Venta | null>(null);

  const mediciones = useData<Medicion[]>(cliente ? `/vendedor/clientes/${cliente.id}/mediciones` : null);
  const apartados = useData<Apartado[]>(cliente ? `/vendedor/clientes/${cliente.id}/apartados` : null);
  const aros = useData<Aro[]>("/vendedor/aros");
  const lunas = useData<Luna[]>("/vendedor/lunas");
  const listaAccesorios = useData<Accesorio[]>("/vendedor/accesorios");

  // Preselección desde /vendedor/clientes (?cliente=ID)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("cliente");
    if (id) api<Cliente>(`/vendedor/clientes/${id}`).then(setCliente).catch(() => undefined);
  }, []);

  // Por defecto, la medición más reciente del cliente
  const medicionId = mediciones.data?.some((m) => m.id === medicionElegida)
    ? medicionElegida
    : (mediciones.data?.[0]?.id ?? null);

  const apartadosPendientes = useMemo(
    () => new Set(apartados.data?.filter((a) => a.estado === "PENDIENTE").map((a) => a.aroId)),
    [apartados.data],
  );

  // Aros con stock; los apartados por el cliente primero
  const arosVisibles = useMemo(() => {
    const q = busquedaAro.trim().toLowerCase();
    return (aros.data ?? [])
      .filter((a) => a.stock > 0 && (!q || `${a.codigo} ${a.marca} ${a.modelo}`.toLowerCase().includes(q)))
      .sort((a, b) => Number(apartadosPendientes.has(b.id)) - Number(apartadosPendientes.has(a.id)));
  }, [aros.data, busquedaAro, apartadosPendientes]);

  const itemsAccesorios = Object.entries(accesorios)
    .filter(([, c]) => c > 0)
    .map(([id, cantidad]) => ({ accesorioId: Number(id), cantidad }));
  const request = cliente && medicionId && aroId && lunaId
    ? { clienteId: cliente.id, medicionId, aroId, lunaId, accesorios: itemsAccesorios }
    : null;
  const requestKey = JSON.stringify(request);

  // Cotización automática cada vez que cambia la selección
  useEffect(() => {
    if (!request) return;
    let vigente = true;
    api<Venta>("/vendedor/ventas/cotizar", { method: "POST", body: request })
      .then((venta) => vigente && setRespuesta({ key: requestKey, venta, error: null }))
      .catch((e) => vigente && setRespuesta({ key: requestKey, venta: null, error: mensajeDeError(e) }));
    return () => { vigente = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);
  const vigente = request && respuesta?.key === requestKey ? respuesta : null;
  const cotizacion = vigente?.venta ?? null;
  const errorCotizacion = vigente?.error ?? null;

  function elegirCliente(c: Cliente) {
    setCliente(c);
    setAroId(null);
  }

  function cambiarAccesorio(id: number, delta: number, max: number) {
    setAccesorios((prev) => ({ ...prev, [id]: Math.min(max, Math.max(0, (prev[id] ?? 0) + delta)) }));
  }

  async function registrar() {
    if (!request) return;
    setRegistrando(true);
    try {
      const venta = await api<Venta>("/vendedor/ventas", { method: "POST", body: request });
      setVentaRegistrada(venta);
      toast.success(`Venta #${venta.id} registrada`, { description: "El stock se actualizó automáticamente." });
    } catch (e) {
      toast.error(mensajeDeError(e));
    } finally {
      setRegistrando(false);
    }
  }

  function reiniciar() {
    setVentaRegistrada(null);
    setCliente(null);
    setAroId(null);
    setLunaId(null);
    setAccesorios({});
    void aros.recargar();
    void lunas.recargar();
    void listaAccesorios.recargar();
  }

  if (ventaRegistrada) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="mx-auto mb-2 size-12 text-emerald-600" />
          <CardTitle className="text-xl">Venta #{ventaRegistrada.id} registrada</CardTitle>
          <CardDescription>
            {ventaRegistrada.clienteNombre} · atendido por {ventaRegistrada.vendedorNombre}
          </CardDescription>
        </CardHeader>
        <CardContent><VentaDetalle venta={ventaRegistrada} /></CardContent>
        <CardFooter className="justify-center gap-2">
          <Button variant="outline" asChild><Link href="/vendedor/ventas">Ver ventas</Link></Button>
          <Button onClick={reiniciar}>Nueva venta</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <PageHeader title="Nueva venta" description="Asocia cliente, medición, aro y lunas. Los totales se calculan automáticamente." />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          <Paso n={1} titulo="Cliente" listo={!!cliente}>
            {cliente ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-3">
                  <UserRound className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{cliente.nombreCompleto}</p>
                    <p className="text-xs text-muted-foreground">DNI {cliente.dni}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setCliente(null)}>Cambiar</Button>
              </div>
            ) : (
              <ClienteBuscador onSelect={elegirCliente} />
            )}
          </Paso>

          <Paso n={2} titulo="Medición" listo={!!medicionId} deshabilitado={!cliente}>
            {mediciones.data?.length ? (
              <div className="grid gap-3">
                {mediciones.data.map((m) => (
                  <Opcion key={m.id} activa={medicionId === m.id} onClick={() => setMedicionElegida(m.id)}>
                    <MedicionResumen m={m} />
                    <div className="mt-2"><MedicionTabla m={m} /></div>
                  </Opcion>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {mediciones.cargando ? "Cargando…" : (
                  <>El cliente no tiene mediciones. <Link className="text-primary underline" href="/vendedor/clientes">Registra una</Link> antes de vender.</>
                )}
              </p>
            )}
          </Paso>

          <Paso n={3} titulo="Aro" listo={!!aroId} deshabilitado={!cliente}>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Buscar aro" value={busquedaAro} onChange={(e) => setBusquedaAro(e.target.value)} />
            </div>
            <div className="grid max-h-96 gap-2 overflow-y-auto sm:grid-cols-2">
              {arosVisibles.map((a) => (
                <Opcion key={a.id} activa={aroId === a.id} onClick={() => setAroId(a.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{a.marca} {a.modelo}</p>
                      <p className="text-xs text-muted-foreground">{a.material} · {a.forma} · {a.codigo}</p>
                    </div>
                    <StockBadge stock={a.stock} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold">{soles(a.precio)}</span>
                    {apartadosPendientes.has(a.id) && (
                      <Badge><BookmarkCheck className="size-3" /> Apartado por el cliente</Badge>
                    )}
                  </div>
                </Opcion>
              ))}
            </div>
          </Paso>

          <Paso n={4} titulo="Lunas (par)" listo={!!lunaId} deshabilitado={!cliente}>
            <div className="grid gap-2 sm:grid-cols-2">
              {lunas.data?.filter((l) => l.stock >= 2).map((l) => (
                <Opcion key={l.id} activa={lunaId === l.id} onClick={() => setLunaId(l.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{l.tipo} · {l.material} {Number(l.indice).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{l.tratamiento ?? "Sin tratamiento"}</p>
                    </div>
                    <StockBadge stock={l.stock} />
                  </div>
                  <p className="mt-2 text-sm"><span className="font-semibold">{soles(l.precio)}</span> c/u × 2</p>
                </Opcion>
              ))}
            </div>
          </Paso>

          <Paso n={5} titulo="Accesorios (opcional)" listo={itemsAccesorios.length > 0} deshabilitado={!cliente}>
            <div className="grid gap-2">
              {listaAccesorios.data?.filter((a) => a.stock > 0).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{a.nombre}</p>
                    <p className="text-xs text-muted-foreground">{soles(a.precio)} · stock {a.stock}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="size-7" aria-label="Quitar"
                            onClick={() => cambiarAccesorio(a.id, -1, a.stock)}><Minus className="size-3" /></Button>
                    <span className="w-6 text-center tabular-nums">{accesorios[a.id] ?? 0}</span>
                    <Button size="icon" variant="outline" className="size-7" aria-label="Agregar"
                            onClick={() => cambiarAccesorio(a.id, 1, a.stock)}><Plus className="size-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Paso>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                {request ? "Cotización calculada por el servidor." : "Completa los pasos 1 a 4 para ver el total."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorCotizacion && (
                <Alert variant="destructive" className="mb-3"><AlertDescription>{errorCotizacion}</AlertDescription></Alert>
              )}
              {cotizacion ? (
                <VentaDetalle venta={cotizacion} />
              ) : (
                <ul className="grid gap-1 text-sm text-muted-foreground">
                  <li>{cliente ? "✓" : "○"} Cliente</li>
                  <li>{medicionId ? "✓" : "○"} Medición</li>
                  <li>{aroId ? "✓" : "○"} Aro</li>
                  <li>{lunaId ? "✓" : "○"} Lunas</li>
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" disabled={!cotizacion || registrando} onClick={registrar}>
                {registrando && <Loader2 className="size-4 animate-spin" />}
                Registrar venta {cotizacion && `· ${soles(cotizacion.total)}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

function Paso({ n, titulo, listo, deshabilitado, children }: {
  n: number; titulo: string; listo: boolean; deshabilitado?: boolean; children: ReactNode;
}) {
  return (
    <Card className={cn(deshabilitado && "pointer-events-none opacity-50")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className={cn(
            "flex size-7 items-center justify-center rounded-full border text-sm",
            listo ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
          )}>{listo ? "✓" : n}</span>
          {titulo}
        </CardTitle>
      </CardHeader>
      {!deshabilitado && <CardContent>{children}</CardContent>}
    </Card>
  );
}

function Opcion({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "rounded-lg border p-3 text-left transition-colors hover:bg-muted/60",
        activa && "border-primary bg-primary/5 ring-1 ring-primary",
      )}
    >
      {children}
    </button>
  );
}
