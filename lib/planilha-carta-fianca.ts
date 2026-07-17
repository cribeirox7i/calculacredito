import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { TaxaCartaFianca } from "@/lib/taxas-carta-fianca";

const CABECALHO = ["instituicao", "plano", "taxa_anual", "prazo_maximo_meses", "fonte_url", "atualizado_em"] as const;

const LINHAS_EXEMPLO = [
  {
    instituicao: "Exemplo (apague esta linha)",
    plano: "Padrão",
    taxa_anual: "2,50",
    prazo_maximo_meses: "24",
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

function linhasParaModelo(taxasAtuais: TaxaCartaFianca[]) {
  return taxasAtuais.length > 0
    ? taxasAtuais.map((t) => ({
        instituicao: t.instituicao,
        plano: t.plano,
        taxa_anual: String(t.taxaAnual).replace(".", ","),
        prazo_maximo_meses: String(t.prazoMaximoMeses),
        fonte_url: t.fonteUrl ?? "",
        atualizado_em: t.atualizadoEm,
      }))
    : LINHAS_EXEMPLO;
}

// ";" como delimitador pelo mesmo motivo dos outros comparadores curados
// deste site: a coluna de taxa usa vírgula decimal, que colidiria com ","
// como separador de coluna. BOM no início garante abertura como UTF-8 no
// Excel.
export function gerarCsvModelo(taxasAtuais: TaxaCartaFianca[]): string {
  return "﻿" + Papa.unparse({ fields: [...CABECALHO], data: linhasParaModelo(taxasAtuais) }, { delimiter: ";" });
}

export function gerarXlsxModelo(taxasAtuais: TaxaCartaFianca[]): Buffer {
  const planilha = XLSX.utils.json_to_sheet(linhasParaModelo(taxasAtuais), { header: [...CABECALHO] });
  const pasta = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(pasta, planilha, "Taxas");
  return XLSX.write(pasta, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export type ErroLinhaCsv = { linha: number; motivo: string };

export type ResultadoImportacaoCsv = {
  validas: Omit<TaxaCartaFianca, "id" | "atualizadoEm">[];
  erros: ErroLinhaCsv[];
};

export function validarLinhasTaxas(linhas: Record<string, string>[]): ResultadoImportacaoCsv {
  const validas: Omit<TaxaCartaFianca, "id" | "atualizadoEm">[] = [];
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

    const taxaAnual = parseNumero(linha.taxa_anual ?? "");
    if (taxaAnual === null || taxaAnual <= 0) {
      erros.push({ linha: numeroLinha, motivo: `Taxa anual "${linha.taxa_anual}" inválida.` });
      return;
    }

    const prazoMaximoMeses = parseNumero(linha.prazo_maximo_meses ?? "");
    if (prazoMaximoMeses === null || prazoMaximoMeses <= 0) {
      erros.push({ linha: numeroLinha, motivo: `Prazo máximo "${linha.prazo_maximo_meses}" inválido.` });
      return;
    }

    validas.push({
      instituicao,
      plano,
      taxaAnual,
      prazoMaximoMeses: Math.round(prazoMaximoMeses),
      fonteUrl: (linha.fonte_url ?? "").trim() || null,
    });
  });

  return { validas, erros };
}
