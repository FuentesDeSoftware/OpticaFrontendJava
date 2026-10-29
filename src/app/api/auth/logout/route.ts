import { NextResponse } from "next/server";
import { COOKIE_TOKEN } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_TOKEN);
  return response;
}
