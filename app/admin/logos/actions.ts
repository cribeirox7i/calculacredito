"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { caminhoBlob } from "@/lib/logos";

export async function enviarLogo(formData: FormData) {
  const nome = formData.get("nome");
  const arquivo = formData.get("arquivo");

  if (typeof nome !== "string" || !nome.trim() || !(arquivo instanceof File) || arquivo.size === 0) {
    throw new Error("Informe o nome da instituição e um arquivo de imagem.");
  }

  await put(caminhoBlob(nome), arquivo, {
    access: "public",
    allowOverwrite: true,
  });

  revalidatePath("/admin/logos");
}

export async function excluirLogo(url: string) {
  await del(url);
  revalidatePath("/admin/logos");
}
