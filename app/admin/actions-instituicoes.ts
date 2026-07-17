"use server";

import { revalidatePath } from "next/cache";
import { caminhoLogo } from "@/lib/logos";
import { lerLinhasPlanilha } from "@/lib/planilha";
import { validarLinhasSites } from "@/lib/planilha-sites";
import { excluirObjeto, gravarObjeto } from "@/lib/r2";
import { removerSite, salvarSite } from "@/lib/sites";
import type { ResultadoImportacaoUI } from "./tipos-importacao";

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
    const buffer = Buffer.from(await (arquivo as File).arrayBuffer());
    await gravarObjeto(caminhoLogo(cnpj8.trim()), buffer, (arquivo as File).type || "image/png");
  }

  if (temSite) {
    await salvarSite(cnpj8.trim(), normalizarUrl(site as string));
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function excluirLogo(cnpj8: string) {
  await excluirObjeto(caminhoLogo(cnpj8));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function excluirSite(cnpj8: string) {
  await removerSite(cnpj8);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

// Faz upsert linha a linha (não apaga cnpj8 ausentes da planilha) - uma
// reimportação parcial não derruba instituições já cadastradas por fora.
// Assinatura (prevState, formData) compatível com useActionState.
export async function importarArquivoSites(
  _estadoAnterior: ResultadoImportacaoUI,
  formData: FormData
): Promise<ResultadoImportacaoUI> {
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, mensagem: "Selecione um arquivo CSV ou Excel." };
  }

  try {
    const linhas = await lerLinhasPlanilha(arquivo);
    const { validas, erros } = validarLinhasSites(linhas);

    for (const { cnpj8, site } of validas) {
      await salvarSite(cnpj8, site);
    }

    revalidatePath("/admin");
    revalidatePath("/", "layout");

    if (erros.length > 0) {
      return {
        ok: validas.length > 0,
        mensagem:
          `Importados ${validas.length} site(s) com sucesso. ${erros.length} linha(s) com erro, não importadas:\n` +
          erros.map((e) => `Linha ${e.linha}: ${e.motivo}`).join("\n"),
      };
    }

    return { ok: true, mensagem: `Importados ${validas.length} site(s) com sucesso.` };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? `Falha ao ler o arquivo: ${erro.message}` : "Falha ao ler o arquivo.",
    };
  }
}
