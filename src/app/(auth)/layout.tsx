import Link from "next/link";
import { Glasses } from "lucide-react";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <Link href="/" prefetch={false} className="mb-6 flex items-center gap-2 font-semibold">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Glasses className="size-5" />
        </span>
        Óptica Visión Clara
      </Link>
      {children}
    </main>
  );
}
