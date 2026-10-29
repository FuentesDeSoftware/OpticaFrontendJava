import { ClienteShell } from "./shell";

export default function ClienteLayout({ children }: LayoutProps<"/cliente">) {
  return <ClienteShell>{children}</ClienteShell>;
}
