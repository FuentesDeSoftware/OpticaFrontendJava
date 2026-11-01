import Link from "next/link";
import { Glasses, ClipboardList, ShoppingBag, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: ClipboardList, title: "Tus mediciones", text: "Consulta el historial de tus recetas oftalmológicas." },
  { icon: Glasses, title: "Catálogo de aros", text: "Filtra por marca, material, forma y precio, y aparta tu favorito." },
  { icon: Boxes, title: "Inventario", text: "Los vendedores gestionan aros, lunas y accesorios con alertas de stock." },
  { icon: ShoppingBag, title: "Ventas", text: "Registro de ventas con cálculo de ISV y descuento automático de stock." },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Glasses className="size-7" />
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Óptica Visión Clara</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Gestiona tus consultas, elige tus aros y deja que nuestro equipo se encargue del resto.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/registro">Crear cuenta</Link>
          </Button>
        </div>

        <div className="mt-16 grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-background p-5">
              <f.icon className="mb-3 size-5 text-primary" />
              <p className="font-medium">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
