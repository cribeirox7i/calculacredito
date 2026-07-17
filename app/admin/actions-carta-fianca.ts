"use server";

import { revalidatePath } from "next/cache";
import { lerLinhasPlanilha } from "@/lib/planilha";
import { validarLinhasTaxas } from "@/lib/planilha-carta-fianca";
import {
  adicionarTaxaCartaFianca,
  atualizarTaxaCartaFianca,
  limparTodasTaxasCartaFianca,
  removerTaxaCartaFianca,
  substituirTaxasDaInstituicao,
  type TaxaCartaFianca,
} from "@/lib/taxas-carta-fianca";
import type { ResultadoImportacaoUI } from "./tipos-importacao";

function lerCamposTaxa(formData: FormData): Omit<TaxaCartaFianca, "id" | "atualizadoEm"> {
  const instituicao = String(formData.get("instituicao") ?? "").trim();
  const plano = String(formData.get("plano") ?? "").trim();
  const taxaTexto = String(formData.get("taxaAnual") ?? "").trim();
  const prazoTexto = String(formData.get("prazoMaximoMeses") ?? "").trim();
  const fonteUrl = String(formData.get("fonteUrl") ?? "").trim();

  if (!instituicao || !plano) {
    throw new Error("Informe instituição e plano.");
  }

  const taxaAnual = Number(taxaTexto.replace(",", "."));
  if (!Number.isFinite(taxaAnual) || taxaAnual <= 0) {
    throw new Error("Taxa anual inválida.");
  }

  const prazoMaximoMeses = Number(prazoTexto);
  if (!Number.isFinite(prazoMaximoMeses) || prazoMaximoMeses <= 0) {
    throw new Error("Prazo máximo (meses) inválido.");
  }

  return { instituicao, plano, taxaAnual, prazoMaximoMeses: Math.round(prazoMaximoMeses), fonteUrl: fonteUrl || null };
}

export async function adicionarTaxa(formData: FormData) {
  await adicionarTaxaCartaFianca(lerCamposTaxa(formData));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function editarTaxa(id: string, formData: FormData) {
  await atualizarTaxaCartaFianca(id, lerCamposTaxa(formData));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function removerTaxa(id: string) {
  await removerTaxaCartaFianca(id);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function limparTaxas() {
  await limparTodasTaxasCartaFianca();
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
      await substituirTaxasDaInstituicao(instituicao, linhasDaInstituicao);
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
