import { UsuarioActual } from "@/components/usuario-actual";
import { VendedorShell } from "./shell";

export default function VendedorLayout({ children }: LayoutProps<"/vendedor">) {
  return <VendedorShell usuario={<UsuarioActual />}>{children}</VendedorShell>;
}
