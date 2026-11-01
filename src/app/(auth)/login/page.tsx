"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";

export default function LoginPage() {
  const [estado, accion, enviando] = useActionState(login, null);
  const error = estado?.mensaje;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>Ingresa con tu correo y contraseña.</CardDescription>
      </CardHeader>
      <form action={accion}>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field label="Correo" name="email" type="email" autoComplete="email" required placeholder="tu@correo.com"
                 defaultValue={estado?.valores?.email} />
          <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required />
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando && <Loader2 className="size-4 animate-spin" />}
            Ingresar
          </Button>
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" prefetch={false} className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
          <div className="w-full rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Cuentas de demostración (clave 123456)</p>
            <p>vendedor@optica.com · cliente@optica.com</p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
