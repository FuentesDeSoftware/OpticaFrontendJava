"use client";

import { useEffect, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { query } from "@/lib/api";
import type { Cliente } from "@/lib/types";
import { useData } from "@/lib/use-data";
import { cn } from "@/lib/utils";

/** Busca clientes por DNI, nombres o apellidos. */
export function ClienteBuscador({ seleccionado, onSelect }: { seleccionado?: number | null; onSelect: (c: Cliente) => void }) {
  const [texto, setTexto] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto]);
  const { data, cargando } = useData<Cliente[]>(`/vendedor/clientes${query({ q })}`);

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="DNI, nombres o apellidos" value={texto} onChange={(e) => setTexto(e.target.value)} />
      </div>
      <div className="grid max-h-80 gap-1 overflow-y-auto">
        {cargando && !data ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">Buscando…</p>
        ) : data?.length ? (
          data.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                seleccionado === c.id && "border-primary bg-primary/5",
              )}
            >
              <UserRound className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">
                <span className="block font-medium">{c.nombreCompleto}</span>
                <span className="text-xs text-muted-foreground">DNI {c.dni} · {c.email}</span>
              </span>
            </button>
          ))
        ) : (
          <p className="px-2 py-4 text-sm text-muted-foreground">No se encontraron clientes.</p>
        )}
      </div>
    </div>
  );
}
