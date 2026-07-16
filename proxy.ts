import { NextResponse, type NextRequest } from "next/server";
import { verificarSessaoAdmin } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get("admin_session")?.value;

  if (!(await verificarSessaoAdmin(cookie))) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/exportar-sites",
    "/admin/exportar-sites-xlsx",
    "/admin/exportar-maquininhas",
    "/admin/exportar-maquininhas-xlsx",
  ],
};
