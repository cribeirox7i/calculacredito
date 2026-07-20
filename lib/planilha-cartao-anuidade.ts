import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { TaxaCartaoAnuidade } from "@/lib/taxas-cartao-anuidade";

const CABECALHO = ["instituicao", "cartao", "valor_anuidade", "beneficios", "fonte_url", "atualizado_em"] as const;

const LINHAS_EXEMPLO = [
  {
    instituicao: "Exemplo (apague esta linha)",
    cartao: "Platinum",
    valor_anuidade: "0",
    beneficios: "Milhas, seguro viagem, sala VIP",
    fonte_url: "",
    atualizado_em: "",
  },
];

function parseNumero(valor: string): number | null {
  const limpo = valor.trim().replace("%", "").replace(",", ".");
  if (limpo === "") return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

function linhasParaModelo(taxasAtuais: TaxaCartaoAnuidade[]) {
  return taxasAtuais.length > 0
    ? taxasAtuais.map((t) => ({
        instituicao: t.instituicao,
        cartao: t.cartao,
        valor_anuidade: String(t.valorAnuidade).replace(".", ","),
        beneficios: t.beneficios,
        fonte_url: t.fonteUrl ?? "",
        atualizado_em: t.atualizadoEm,
      }))
    : LINHAS_EXEMPLO;
}

// ";" como delimitador pelo mesmo motivo de lib/planilha-hotmoney.ts: a
// coluna de valor usa vírgula decimal, que colidiria com "," como separador
// de coluna. BOM no início garante abertura como UTF-8 no Excel.
export function gerarCsvModelo(taxasAtuais: TaxaCartaoAnuidade[]): string {
  return "﻿" + Papa.unparse({ fields: [...CABECALHO], data: linhasParaModelo(taxasAtuais) }, { delimiter: ";" });
}

export function gerarXlsxModelo(taxasAtuais: TaxaCartaoAnuidade[]): Buffer {
  const planilha = XLSX.utils.json_to_sheet(linhasParaModelo(taxasAtuais), { header: [...CABECALHO] });
  const pasta = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(pasta, planilha, "Taxas");
  return XLSX.write(pasta, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export type ErroLinhaCsv = { linha: number; motivo: string };

export type ResultadoImportacaoCsv = {
  validas: Omit<TaxaCartaoAnuidade, "id" | "atualizadoEm">[];
  erros: ErroLinhaCsv[];
};

export function validarLinhasTaxas(linhas: Record<string, string>[]): ResultadoImportacaoCsv {
  const validas: Omit<TaxaCartaoAnuidade, "id" | "atualizadoEm">[] = [];
  const erros: ErroLinhaCsv[] = [];

  linhas.forEach((linha, indice) => {
    const numeroLinha = indice + 2; // +1 pelo cabeçalho, +1 por índice 0-based
    const instituicao = (linha.instituicao ?? "").trim();
    const cartao = (linha.cartao ?? "").trim();

    if (!instituicao || instituicao.startsWith("Exemplo")) return;

    if ("__parsed_extra" in linha) {
      erros.push({
        linha: numeroLinha,
        motivo:
          "Linha com mais colunas do que o esperado - provavelmente a vírgula decimal do valor colidiu com o separador de coluna do CSV. Use o modelo em Excel (.xlsx) ou baixe o modelo CSV mais recente.",
      });
      return;
    }
    if (!cartao) {
      erros.push({ linha: numeroLinha, motivo: "Coluna 'cartao' vazia." });
      return;
    }

    const valorAnuidade = parseNumero(linha.valor_anuidade ?? "");
    if (valorAnuidade === null || valorAnuidade < 0) {
      erros.push({ linha: numeroLinha, motivo: `Valor de anuidade "${linha.valor_anuidade}" inválido.` });
      return;
    }

    validas.push({
      instituicao,
      cartao,
      valorAnuidade,
      beneficios: (linha.beneficios ?? "").trim(),
      fonteUrl: (linha.fonte_url ?? "").trim() || null,
    });
  });

  return { validas, erros };
}
