"use server";

import { revalidatePath } from "next/cache";
import { lerLinhasPlanilha } from "@/lib/planilha";
import { validarLinhasTaxas } from "@/lib/planilha-maquininhas";
import {
  adicionarTaxaMaquininha,
  atualizarTaxaMaquininha,
  limparTodasTaxas,
  removerTaxaMaquininha,
  substituirTaxasDoAdquirente,
  type ModalidadeTaxa,
  type TaxaMaquininha,
} from "@/lib/taxas-maquininha";
import type { ResultadoImportacaoUI } from "./tipos-importacao";

const MODALIDADES_VALIDAS: ModalidadeTaxa[] = ["pix", "debito", "credito_vista", "credito_parcelado"];

function lerCamposTaxa(formData: FormData): Omit<TaxaMaquininha, "id" | "atualizadoEm"> {
  const adquirente = String(formData.get("adquirente") ?? "").trim();
  const plano = String(formData.get("plano") ?? "").trim();
  const modalidade = String(formData.get("modalidade") ?? "") as ModalidadeTaxa;
  const parcelasTexto = String(formData.get("parcelas") ?? "").trim();
  const taxaTexto = String(formData.get("taxa") ?? "").trim();
  const fonteUrl = String(formData.get("fonteUrl") ?? "").trim();

  if (!adquirente || !plano) {
    throw new Error("Informe adquirente e plano.");
  }
  if (!MODALIDADES_VALIDAS.includes(modalidade)) {
    throw new Error("Modalidade inválida.");
  }

  const parcelas = parcelasTexto ? Number(parcelasTexto) : null;
  if (modalidade === "credito_parcelado" && (!parcelas || parcelas < 2)) {
    throw new Error("Informe o número de parcelas (>= 2) para crédito parcelado.");
  }
  if (modalidade !== "credito_parcelado" && parcelas !== null) {
    throw new Error("Parcelas só se aplica a crédito parcelado.");
  }

  const taxa = Number(taxaTexto.replace(",", "."));
  if (!Number.isFinite(taxa)) {
    throw new Error("Taxa inválida.");
  }

  return { adquirente, plano, modalidade, parcelas, taxa, fonteUrl: fonteUrl || null };
}

export async function adicionarTaxa(formData: FormData) {
  await adicionarTaxaMaquininha(lerCamposTaxa(formData));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function editarTaxa(id: string, formData: FormData) {
  await atualizarTaxaMaquininha(id, lerCamposTaxa(formData));
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function removerTaxa(id: string) {
  await removerTaxaMaquininha(id);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function limparTaxas() {
  await limparTodasTaxas();
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

// Assinatura (prevState, formData) compatível com useActionState - retorna
// o resultado em vez de lançar, pra UI mostrar progresso/erro inline sem
// cair na tela de erro genérica do Next em caso de linha inválida.
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

    const porAdquirente = new Map<string, typeof validas>();
    for (const linha of validas) {
      const grupo = porAdquirente.get(linha.adquirente) ?? [];
      grupo.push(linha);
      porAdquirente.set(linha.adquirente, grupo);
    }

    for (const [adquirente, linhasDoAdquirente] of porAdquirente) {
      await substituirTaxasDoAdquirente(adquirente, linhasDoAdquirente);
    }

    revalidatePath("/admin");
    revalidatePath("/", "layout");

    if (erros.length > 0) {
      return {
        ok: validas.length > 0,
        mensagem:
          `Importadas ${validas.length} linha(s) com sucesso (${porAdquirente.size} adquirente(s)). ` +
          `${erros.length} linha(s) com erro, não importadas:\n` +
          erros.map((e) => `Linha ${e.linha}: ${e.motivo}`).join("\n"),
      };
    }

    return {
      ok: true,
      mensagem: `Importadas ${validas.length} linha(s) com sucesso (${porAdquirente.size} adquirente(s)).`,
    };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? `Falha ao ler o arquivo: ${erro.message}` : "Falha ao ler o arquivo.",
    };
  }
}
