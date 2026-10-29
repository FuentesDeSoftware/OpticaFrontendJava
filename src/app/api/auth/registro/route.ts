import { autenticar } from "@/lib/auth-handler";

export async function POST(request: Request) {
  return autenticar(request, "registro");
}
