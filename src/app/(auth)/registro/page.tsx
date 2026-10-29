"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (form.password !== form.confirmar) {
      setErrores({ confirmar: "Las contraseñas no coinciden" });
      return;
    }
    setEnviando(true);
    setError(null);
    setErrores({});
    try {
      const body: Record<string, string> = { ...form };
      delete body.confirmar;
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.mensaje ?? "No se pudo crear la cuenta");
        setErrores(data.errores ?? {});
        return;
      }
      router.replace("/cliente");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Crear cuenta</CardTitle>
        <CardDescription>Regístrate para consultar tus mediciones y apartar aros.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {error && (
            <Alert variant="destructive" className="sm:col-span-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field label="Nombres" name="nombres" required maxLength={80} error={errores.nombres} />
          <Field label="Apellidos" name="apellidos" required maxLength={80} error={errores.apellidos} />
          <Field label="DNI" name="dni" required inputMode="numeric" pattern="\d{8}" maxLength={8}
                 title="8 dígitos" error={errores.dni} />
          <Field label="Teléfono" name="telefono" required inputMode="tel" pattern="\d{9}" maxLength={9}
                 title="9 dígitos" error={errores.telefono} />
          <div className="sm:col-span-2">
            <Field label="Correo" name="email" type="email" required autoComplete="email" error={errores.email} />
          </div>
          <Field label="Contraseña" name="password" type="password" required minLength={6}
                 autoComplete="new-password" error={errores.password} />
          <Field label="Confirmar contraseña" name="confirmar" type="password" required minLength={6}
                 autoComplete="new-password" error={errores.confirmar} />
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando && <Loader2 className="size-4 animate-spin" />}
            Crear cuenta
          </Button>
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" prefetch={false} className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
