"use server";

import { revalidatePath } from "next/cache";
import { lerLinhasPlanilha } from "@/lib/planilha";
import { validarLinhasTaxas } from "@/lib/planilha-hotmoney";
import {
  adicionarTaxaHotMoney,
  atualizarTaxaHotMoney,
  limparTodasTaxasHotMoney,
  removerTaxaHotMoney,
  substituirTaxasDaInstituicao,
  type TaxaHotMoney,
} from "@/lib/taxas-hotmoney";
import type { ResultadoImportacaoUI } from "./tipos-importacao";

function lerCamposTaxa(formData: FormData): Omit<TaxaHotMoney, "id" | "atualizadoEm"> {
  const instituicao = String(formData.get("instituicao") ?? "").trim();
  const plano = String(formData.get("plano") ?? "").trim();
  const taxaTexto = String(formData.get("taxaMensal") ?? "").trim();
  const prazoTexto = String(formData.get("prazoMaximoDias") ?? "").trim();
  const fonteUrl = String(formData.get("fonteUrl") ?? "").trim();

  if (!instituicao || !plano) {
    throw new Error("Informe instituição e plano.");
  }

  const taxaMensal = Number(taxaTexto.replace(",", "."));
  if (!Number.isFinite(taxaMensal) || taxaMensal <= 0) {
    throw new Error("Taxa mensal inválida.");
  }

  const prazoMaximoDias = Number(prazoTexto);
  if (!Number.isFinite(prazoMaximoDias) || prazoMaximoDias <= 0) {
    throw new Error("Prazo máximo (dias) inválido.");
  }

  return { instituicao, plano, taxaMensal, prazoMaximoDias: Math.round(prazoMaximoDias), fonteUrl: fonteUrl || null };
}

export async function adicionarTaxa(formData: FormData) {
  await adicionarTaxaHotMoney(lerCamposTaxa(formData));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function editarTaxa(id: string, formData: FormData) {
  await atualizarTaxaHotMoney(id, lerCamposTaxa(formData));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function removerTaxa(id: string) {
  await removerTaxaHotMoney(id);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function limparTaxas() {
  await limparTodasTaxasHotMoney();
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
