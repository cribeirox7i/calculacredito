"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { caminhoBlob } from "@/lib/logos";

export async function enviarLogo(formData: FormData) {
  const cnpj8 = formData.get("cnpj8");
  const arquivo = formData.get("arquivo");

  if (
    typeof cnpj8 !== "string" ||
    !/^\d{8}$/.test(cnpj8.trim()) ||
    !(arquivo instanceof File) ||
    arquivo.size === 0
  ) {
    throw new Error("Informe um CNPJ8 válido (8 dígitos) e um arquivo de imagem.");
  }

  await put(caminhoBlob(cnpj8.trim()), arquivo, {
    access: "public",
    allowOverwrite: true,
  });

  revalidatePath("/admin/logos");
  revalidatePath("/", "layout");
}

export async function excluirLogo(url: string) {
  await del(url);
  revalidatePath("/admin/logos");
  revalidatePath("/", "layout");
}
