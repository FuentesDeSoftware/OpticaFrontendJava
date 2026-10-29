import { Badge } from "@/components/ui/badge";

export const UMBRAL_STOCK = 5;

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Agotado</Badge>;
  if (stock < UMBRAL_STOCK) return <Badge variant="destructive">{stock} · Bajo</Badge>;
  return <Badge variant="secondary">{stock}</Badge>;
}
