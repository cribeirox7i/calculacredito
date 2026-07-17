"use server";

import { revalidatePath } from "next/cache";
import { LINKS_PF, LINKS_PJ } from "@/lib/navegacao";
import { salvarOperacoesOcultas } from "@/lib/visibilidade-operacoes";

export async function salvarVisibilidade(formData: FormData) {
  // Checkbox marcado = visível. Um checkbox desmarcado simplesmente não é
  // enviado no FormData, então a lista de ocultas é o complemento dos hrefs
  // marcados contra o universo total de operações.
  const visiveis = new Set(formData.getAll("visivel").map(String));
  const todosHrefs = [...LINKS_PF, ...LINKS_PJ].map((link) => link.href);
  const ocultas = todosHrefs.filter((href) => !visiveis.has(href));

  await salvarOperacoesOcultas(ocultas);
  // "layout" revalida o NavBar/Footer (renderizados no root layout) em todo
  // o site, não só na home.
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}
