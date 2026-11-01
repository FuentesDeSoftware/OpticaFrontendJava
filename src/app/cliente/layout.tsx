import { UsuarioActual } from "@/components/usuario-actual";
import { ClienteShell } from "./shell";

export default function ClienteLayout({ children }: LayoutProps<"/cliente">) {
  return <ClienteShell usuario={<UsuarioActual />}>{children}</ClienteShell>;
}
