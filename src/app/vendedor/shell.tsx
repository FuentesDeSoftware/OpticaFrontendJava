"use client";

import type { ReactNode } from "react";
import { Boxes, LayoutDashboard, Receipt, ShoppingCart, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/vendedor", label: "Panel", icon: LayoutDashboard },
  { href: "/vendedor/inventario", label: "Inventario", icon: Boxes },
  { href: "/vendedor/clientes", label: "Clientes", icon: Users },
  { href: "/vendedor/ventas/nueva", label: "Nueva venta", icon: ShoppingCart },
  { href: "/vendedor/ventas", label: "Ventas", icon: Receipt },
];

export function VendedorShell({ children }: { children: ReactNode }) {
  return (
    <AppShell nav={nav} rolLabel="Vendedor">
      {children}
    </AppShell>
  );
}
