"use server";

import { revalidatePath } from "next/cache";
import { lerLinhasPlanilha } from "@/lib/planilha";
import { validarLinhasTaxas } from "@/lib/planilha-cartao-anuidade";
import {
  adicionarTaxaCartaoAnuidade,
  atualizarTaxaCartaoAnuidade,
  limparTodasTaxasCartaoAnuidade,
  removerTaxaCartaoAnuidade,
  substituirTaxasCartaoAnuidadeDaInstituicao,
  type TaxaCartaoAnuidade,
} from "@/lib/taxas-cartao-anuidade";
import type { ResultadoImportacaoUI } from "./tipos-importacao";

function lerCamposTaxa(formData: FormData): Omit<TaxaCartaoAnuidade, "id" | "atualizadoEm"> {
  const instituicao = String(formData.get("instituicao") ?? "").trim();
  const cartao = String(formData.get("cartao") ?? "").trim();
  const valorTexto = String(formData.get("valorAnuidade") ?? "").trim();
  const beneficios = String(formData.get("beneficios") ?? "").trim();
  const fonteUrl = String(formData.get("fonteUrl") ?? "").trim();

  if (!instituicao || !cartao) {
    throw new Error("Informe instituição e cartão.");
  }

  const valorAnuidade = Number(valorTexto.replace(",", "."));
  if (!Number.isFinite(valorAnuidade) || valorAnuidade < 0) {
    throw new Error("Valor de anuidade inválido.");
  }

  return { instituicao, cartao, valorAnuidade, beneficios, fonteUrl: fonteUrl || null };
}

export async function adicionarTaxa(formData: FormData) {
  await adicionarTaxaCartaoAnuidade(lerCamposTaxa(formData));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function editarTaxa(id: string, formData: FormData) {
  await atualizarTaxaCartaoAnuidade(id, lerCamposTaxa(formData));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function removerTaxa(id: string) {
  await removerTaxaCartaoAnuidade(id);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function limparTaxas() {
  await limparTodasTaxasCartaoAnuidade();
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function importarArquivo(
  _estadoAnterior: ResultadoImportacaoUI,
  formData: FormData
): Promise<ResultadoImportacaoUI> {
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, mensagem: "Selecione um arquivo CSV ou Excel." };
  }

  try {
    const linhas = await lerLinhasPlanilha(arquivo);
    const { validas, erros } = validarLinhasTaxas(linhas);

    const porInstituicao = new Map<string, typeof validas>();
    for (const linha of validas) {
      const grupo = porInstituicao.get(linha.instituicao) ?? [];
      grupo.push(linha);
      porInstituicao.set(linha.instituicao, grupo);
    }

    for (const [instituicao, linhasDaInstituicao] of porInstituicao) {
      await substituirTaxasCartaoAnuidadeDaInstituicao(instituicao, linhasDaInstituicao);
    }

    revalidatePath("/admin");
    revalidatePath("/", "layout");

    if (erros.length > 0) {
      return {
        ok: validas.length > 0,
        mensagem:
          `Importadas ${validas.length} linha(s) com sucesso (${porInstituicao.size} instituição(ões)). ` +
          `${erros.length} linha(s) com erro, não importadas:\n` +
          erros.map((e) => `Linha ${e.linha}: ${e.motivo}`).join("\n"),
      };
    }

    return {
      ok: true,
      mensagem: `Importadas ${validas.length} linha(s) com sucesso (${porInstituicao.size} instituição(ões)).`,
    };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? `Falha ao ler o arquivo: ${erro.message}` : "Falha ao ler o arquivo.",
    };
  }
}
