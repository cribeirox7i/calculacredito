"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { criarSessaoAdmin } from "@/lib/admin-auth";

export async function login(formData: FormData) {
  const senha = formData.get("senha");

  if (typeof senha !== "string" || senha !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?erro=1");
  }

  const sessao = await criarSessaoAdmin();
  const cookieStore = await cookies();
  cookieStore.set("admin_session", sessao, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  redirect("/admin/logos");
}
