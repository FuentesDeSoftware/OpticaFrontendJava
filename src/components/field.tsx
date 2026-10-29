import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Input con etiqueta y mensaje de error de validación del backend. */
export function Field({ label, error, id, name, ...props }: ComponentProps<typeof Input> & { label: string; error?: string }) {
  const fieldId = id ?? name;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} name={name} aria-invalid={!!error || undefined} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
