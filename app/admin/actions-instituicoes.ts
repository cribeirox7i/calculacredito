"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { parseCsvSites } from "@/lib/csv-sites";
import { caminhoBlob } from "@/lib/logos";
import { removerSite, salvarSite } from "@/lib/sites";

function normalizarUrl(url: string): string {
  const limpa = url.trim();
  return /^https?:\/\//i.test(limpa) ? limpa : `https://${limpa}`;
}

export async function salvarInstituicao(formData: FormData) {
  const cnpj8 = formData.get("cnpj8");
  const arquivo = formData.get("arquivo");
  const site = formData.get("site");

  if (typeof cnpj8 !== "string" || !/^\d{8}$/.test(cnpj8.trim())) {
    throw new Error("Informe um CNPJ8 válido (8 dígitos).");
  }

  const temArquivo = arquivo instanceof File && arquivo.size > 0;
  const temSite = typeof site === "string" && site.trim().length > 0;

  if (!temArquivo && !temSite) {
    throw new Error("Informe um arquivo de imagem e/ou o site oficial da instituição.");
  }

  if (temArquivo) {
    await put(caminhoBlob(cnpj8.trim()), arquivo as File, {
      access: "public",
      allowOverwrite: true,
    });
  }

  if (temSite) {
    await salvarSite(cnpj8.trim(), normalizarUrl(site as string));
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function excluirLogo(url: string) {
  await del(url);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function excluirSite(cnpj8: string) {
  await removerSite(cnpj8);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

// Faz upsert linha a linha (não apaga cnpj8 ausentes do CSV) - uma
// reimportação parcial não derruba instituições já cadastradas por fora.
export async function importarSitesCsv(formData: FormData) {
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    throw new Error("Selecione um arquivo CSV.");
  }

  const texto = await arquivo.text();
  const { validas, erros } = parseCsvSites(texto);

  for (const { cnpj8, site } of validas) {
    await salvarSite(cnpj8, site);
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");

  if (erros.length > 0) {
    throw new Error(
      `Importados ${validas.length} site(s) com sucesso. ${erros.length} linha(s) com erro, não importadas:\n` +
        erros.map((e) => `Linha ${e.linha}: ${e.motivo}`).join("\n")
    );
  }
}
