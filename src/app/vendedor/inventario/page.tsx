"use client";

import { PageHeader } from "@/components/app-shell";
import { ProductoCrud } from "@/components/producto-crud";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Accesorio, Aro, Luna } from "@/lib/types";

export default function Inventario() {
  return (
    <>
      <PageHeader title="Inventario" description="Administra aros, lunas y accesorios. Las filas en rojo tienen stock bajo (< 5)." />
      <Tabs defaultValue="aros">
        <TabsList className="mb-4">
          <TabsTrigger value="aros">Aros</TabsTrigger>
          <TabsTrigger value="lunas">Lunas</TabsTrigger>
          <TabsTrigger value="accesorios">Accesorios</TabsTrigger>
        </TabsList>

        <TabsContent value="aros">
          <ProductoCrud<Aro>
            recurso="aros"
            singular="Aro"
            campos={[
              { name: "marca", label: "Marca", required: true },
              { name: "modelo", label: "Modelo", required: true },
              { name: "material", label: "Material", required: true },
              { name: "forma", label: "Forma", required: true },
              { name: "color", label: "Color" },
              { name: "imagenUrl", label: "URL de imagen", full: true },
            ]}
            columnas={[
              { header: "Marca / Modelo", cell: (a) => <><p className="font-medium">{a.marca}</p><p className="text-xs text-muted-foreground">{a.modelo}</p></> },
              { header: "Material", cell: (a) => a.material },
              { header: "Forma", cell: (a) => a.forma },
              { header: "Color", cell: (a) => a.color ?? "—" },
            ]}
          />
        </TabsContent>

        <TabsContent value="lunas">
          <ProductoCrud<Luna>
            recurso="lunas"
            singular="Luna"
            campos={[
              { name: "tipo", label: "Tipo", type: "select", options: ["MONOFOCAL", "BIFOCAL", "PROGRESIVO"], required: true },
              { name: "material", label: "Material", required: true },
              { name: "indice", label: "Índice de refracción", type: "number", step: "0.01", required: true },
              { name: "tratamiento", label: "Tratamiento" },
            ]}
            columnas={[
              { header: "Tipo", cell: (l) => <span className="font-medium">{l.tipo}</span> },
              { header: "Material", cell: (l) => l.material },
              { header: "Índice", cell: (l) => Number(l.indice).toFixed(2) },
              { header: "Tratamiento", cell: (l) => l.tratamiento ?? "—" },
            ]}
          />
        </TabsContent>

        <TabsContent value="accesorios">
          <ProductoCrud<Accesorio>
            recurso="accesorios"
            singular="Accesorio"
            campos={[
              { name: "nombre", label: "Nombre", required: true },
              { name: "descripcion", label: "Descripción", full: true },
            ]}
            columnas={[
              { header: "Nombre", cell: (a) => <span className="font-medium">{a.nombre}</span> },
              { header: "Descripción", cell: (a) => <span className="text-muted-foreground">{a.descripcion ?? "—"}</span> },
            ]}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
