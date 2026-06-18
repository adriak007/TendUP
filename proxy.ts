import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/producao", "/relatorios", "/configuracoes"];
const DEMO_COOKIE = "tendup_demo";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isDemoRequest = searchParams.get("demo") === "1";
  const hasDemoCookie = request.cookies.get(DEMO_COOKIE)?.value === "1";
  const isDemo = isDemoRequest || hasDemoCookie;

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isLoginRoute = pathname === "/login";

  // Modo teste: nunca consulta o Supabase, equivalente ao ?mock=1/localStorage de hoje.
  if (isDemo) {
    if (isLoginRoute) {
      const response = NextResponse.redirect(new URL("/producao", request.url));
      if (isDemoRequest) response.cookies.set(DEMO_COOKIE, "1", { path: "/" });
      return response;
    }
    const response = NextResponse.next();
    if (isDemoRequest) response.cookies.set(DEMO_COOKIE, "1", { path: "/" });
    return response;
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && isLoginRoute) {
    return NextResponse.redirect(new URL("/producao", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|img/|fonte/).*)"],
};
