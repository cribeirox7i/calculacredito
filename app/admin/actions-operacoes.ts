"use server";

import { revalidatePath } from "next/cache";
import { salvarOperacoesOcultas } from "@/lib/visibilidade-operacoes";

export async function salvarVisibilidade(formData: FormData) {
  const ocultas = formData.getAll("oculta").map(String);
  await salvarOperacoesOcultas(ocultas);
  // "layout" revalida o NavBar/Footer (renderizados no root layout) em todo
  // o site, não só na home.
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}
