"use client";

import type { ReactNode } from "react";
import { Bookmark, ClipboardList, Glasses, Home } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/cliente", label: "Inicio", icon: Home },
  { href: "/cliente/mediciones", label: "Mis mediciones", icon: ClipboardList },
  { href: "/cliente/catalogo", label: "Catálogo de aros", icon: Glasses },
  { href: "/cliente/apartados", label: "Mis apartados", icon: Bookmark },
];

export function ClienteShell({ usuario, children }: { usuario: ReactNode; children: ReactNode }) {
  return (
    <AppShell nav={nav} usuario={usuario} rolLabel="Cliente">
      {children}
    </AppShell>
  );
}
