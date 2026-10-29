"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, mensajeDeError } from "@/lib/api";
import type { Cliente, Medicion } from "@/lib/types";

const ojos = [
  { prefijo: "od", label: "Ojo derecho (OD)" },
  { prefijo: "oi", label: "Ojo izquierdo (OI)" },
];
const valores = [
  { sufijo: "Esfera", label: "Esfera", step: "0.25", min: -20, max: 20 },
  { sufijo: "Cilindro", label: "Cilindro", step: "0.25", min: -10, max: 10 },
  { sufijo: "Eje", label: "Eje (°)", step: "1", min: 0, max: 180 },
  { sufijo: "Adicion", label: "Adición", step: "0.25", min: 0, max: 4 },
];

export function MedicionForm({
  cliente,
  open,
  onOpenChange,
  onCreada,
}: {
  cliente: Cliente;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreada: (m: Medicion) => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const hoy = new Date().toISOString().slice(0, 10);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      fecha: form.get("fecha") || null,
      dip: form.get("dip") ? Number(form.get("dip")) : null,
      observaciones: String(form.get("observaciones") ?? "").trim() || null,
    };
    for (const o of ojos) for (const v of valores) {
      const k = `${o.prefijo}${v.sufijo}`;
      body[k] = Number(form.get(k) || 0);
    }
    setGuardando(true);
    try {
      const m = await api<Medicion>(`/vendedor/clientes/${cliente.id}/mediciones`, { method: "POST", body });
      toast.success("Medición registrada");
      onCreada(m);
      onOpenChange(false);
    } catch (err) {
      setErrores((err as { errores?: Record<string, string> }).errores ?? {});
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva medición</DialogTitle>
          <DialogDescription>Receta de {cliente.nombreCompleto} (DNI {cliente.dni}).</DialogDescription>
        </DialogHeader>
        <form onSubmit={guardar} className="grid gap-5">
          {ojos.map((o) => (
            <fieldset key={o.prefijo} className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">{o.label}</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {valores.map((v) => {
                  const k = `${o.prefijo}${v.sufijo}`;
                  return (
                    <div key={k} className="grid gap-1.5">
                      <Label htmlFor={k} className="text-xs text-muted-foreground">{v.label}</Label>
                      <Input id={k} name={k} type="number" step={v.step} min={v.min} max={v.max}
                             defaultValue={0} required className="font-mono" aria-invalid={!!errores[k] || undefined} />
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" max={hoy} defaultValue={hoy} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dip">DIP (mm)</Label>
              <Input id="dip" name="dip" type="number" step="0.5" min={40} max={80} placeholder="62" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" name="observaciones" maxLength={255} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>
              {guardando && <Loader2 className="size-4 animate-spin" />}
              Guardar medición
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
