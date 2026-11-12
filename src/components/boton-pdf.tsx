import type { ComponentProps, ReactNode } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Abre en otra pestaña un reporte PDF del backend (/api/<ruta>) a través del proxy de Next,
 * que añade el JWT de la cookie: el token nunca llega al navegador.
 */
export function BotonPdf({
  ruta,
  children,
  variant = "outline",
  size,
}: {
  ruta: string;
  children?: ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
}) {
  return (
    <Button asChild variant={variant} size={size}>
      <a href={`/api/proxy${ruta}`} target="_blank" rel="noopener" aria-label={children ? undefined : "Ver PDF"}>
        <FileText className="size-4" />
        {children}
      </a>
    </Button>
  );
}
