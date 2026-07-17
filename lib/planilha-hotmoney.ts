import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { TaxaHotMoney } from "@/lib/taxas-hotmoney";

const CABECALHO = ["instituicao", "plano", "taxa_mensal", "prazo_maximo_dias", "fonte_url", "atualizado_em"] as const;

const LINHAS_EXEMPLO = [
  {
    instituicao: "Exemplo (apague esta linha)",
    plano: "Padrão",
    taxa_mensal: "3,50",
    prazo_maximo_dias: "29",
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

function linhasParaModelo(taxasAtuais: TaxaHotMoney[]) {
  return taxasAtuais.length > 0
    ? taxasAtuais.map((t) => ({
        instituicao: t.instituicao,
        plano: t.plano,
        taxa_mensal: String(t.taxaMensal).replace(".", ","),
        prazo_maximo_dias: String(t.prazoMaximoDias),
        fonte_url: t.fonteUrl ?? "",
        atualizado_em: t.atualizadoEm,
      }))
    : LINHAS_EXEMPLO;
}

// ";" como delimitador pelo mesmo motivo de lib/planilha-fgts.ts: a coluna
// de taxa usa vírgula decimal, que colidiria com "," como separador de
// coluna. BOM no início garante abertura como UTF-8 no Excel.
export function gerarCsvModelo(taxasAtuais: TaxaHotMoney[]): string {
  return "﻿" + Papa.unparse({ fields: [...CABECALHO], data: linhasParaModelo(taxasAtuais) }, { delimiter: ";" });
}

export function gerarXlsxModelo(taxasAtuais: TaxaHotMoney[]): Buffer {
  const planilha = XLSX.utils.json_to_sheet(linhasParaModelo(taxasAtuais), { header: [...CABECALHO] });
  const pasta = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(pasta, planilha, "Taxas");
  return XLSX.write(pasta, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export type ErroLinhaCsv = { linha: number; motivo: string };

export type ResultadoImportacaoCsv = {
  validas: Omit<TaxaHotMoney, "id" | "atualizadoEm">[];
  erros: ErroLinhaCsv[];
};

export function validarLinhasTaxas(linhas: Record<string, string>[]): ResultadoImportacaoCsv {
  const validas: Omit<TaxaHotMoney, "id" | "atualizadoEm">[] = [];
  const erros: ErroLinhaCsv[] = [];

  linhas.forEach((linha, indice) => {
    const numeroLinha = indice + 2; // +1 pelo cabeçalho, +1 por índice 0-based
    const instituicao = (linha.instituicao ?? "").trim();
    const plano = (linha.plano ?? "").trim();

    if (!instituicao || instituicao.startsWith("Exemplo")) return;

    if ("__parsed_extra" in linha) {
      erros.push({
        linha: numeroLinha,
        motivo:
          "Linha com mais colunas do que o esperado - provavelmente a vírgula decimal da taxa colidiu com o separador de coluna do CSV. Use o modelo em Excel (.xlsx) ou baixe o modelo CSV mais recente.",
      });
      return;
    }
    if (!plano) {
      erros.push({ linha: numeroLinha, motivo: "Coluna 'plano' vazia." });
      return;
    }

    const taxaMensal = parseNumero(linha.taxa_mensal ?? "");
    if (taxaMensal === null || taxaMensal <= 0) {
      erros.push({ linha: numeroLinha, motivo: `Taxa mensal "${linha.taxa_mensal}" inválida.` });
      return;
    }

    const prazoMaximoDias = parseNumero(linha.prazo_maximo_dias ?? "");
    if (prazoMaximoDias === null || prazoMaximoDias <= 0) {
      erros.push({ linha: numeroLinha, motivo: `Prazo máximo "${linha.prazo_maximo_dias}" inválido.` });
      return;
    }

    validas.push({
      instituicao,
      plano,
      taxaMensal,
      prazoMaximoDias: Math.round(prazoMaximoDias),
      fonteUrl: (linha.fonte_url ?? "").trim() || null,
    });
  });

  return { validas, erros };
}
