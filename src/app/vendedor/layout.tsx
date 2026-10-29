import { VendedorShell } from "./shell";

export default function VendedorLayout({ children }: LayoutProps<"/vendedor">) {
  return <VendedorShell>{children}</VendedorShell>;
}
