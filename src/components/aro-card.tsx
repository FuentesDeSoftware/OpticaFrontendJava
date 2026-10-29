import type { ReactNode } from "react";
import { Glasses } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { soles } from "@/lib/format";
import type { Aro } from "@/lib/types";

export function AroCard({ aro, children }: { aro: Aro; children?: ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-background">
      <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-muted to-muted/40">
        {aro.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={aro.imagenUrl} alt={aro.etiqueta} className="h-full w-full object-cover" />
        ) : (
          <Glasses className="size-14 text-muted-foreground/50" strokeWidth={1.25} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{aro.marca}</p>
          <p className="font-medium">{aro.modelo}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{aro.material}</Badge>
          <Badge variant="secondary">{aro.forma}</Badge>
          {aro.color && <Badge variant="outline">{aro.color}</Badge>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-semibold">{soles(aro.precio)}</p>
            <p className="text-xs text-muted-foreground">
              {aro.stock < 5 ? `¡Últimas ${aro.stock} unidades!` : `${aro.stock} disponibles`}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
