import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { TaxaFgts } from "@/lib/taxas-fgts";

const CABECALHO = ["instituicao", "plano", "taxa_mensal", "prazo_maximo_anos", "fonte_url", "atualizado_em"] as const;

const LINHAS_EXEMPLO = [
  {
    instituicao: "Exemplo (apague esta linha)",
    plano: "Padrão",
    taxa_mensal: "1,79",
    prazo_maximo_anos: "10",
    fonte_url: "",
    atualizado_em: "",
  },
];

// Aceita taxa/prazo com vírgula (padrão brasileiro/Excel) ou ponto decimal.
function parseNumero(valor: string): number | null {
  const limpo = valor.trim().replace("%", "").replace(",", ".");
  if (limpo === "") return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

function linhasParaModelo(taxasAtuais: TaxaFgts[]) {
  return taxasAtuais.length > 0
    ? taxasAtuais.map((t) => ({
        instituicao: t.instituicao,
        plano: t.plano,
        taxa_mensal: String(t.taxaMensal).replace(".", ","),
        prazo_maximo_anos: String(t.prazoMaximoAnos),
        fonte_url: t.fonteUrl ?? "",
        atualizado_em: t.atualizadoEm,
      }))
    : LINHAS_EXEMPLO;
}

// ";" como delimitador pelo mesmo motivo de lib/planilha-maquininhas.ts: a
// coluna de taxa usa vírgula decimal, que colidiria com "," como separador
// de coluna. BOM no início garante abertura como UTF-8 no Excel.
export function gerarCsvModelo(taxasAtuais: TaxaFgts[]): string {
  return "﻿" + Papa.unparse({ fields: [...CABECALHO], data: linhasParaModelo(taxasAtuais) }, { delimiter: ";" });
}

export function gerarXlsxModelo(taxasAtuais: TaxaFgts[]): Buffer {
  const planilha = XLSX.utils.json_to_sheet(linhasParaModelo(taxasAtuais), { header: [...CABECALHO] });
  const pasta = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(pasta, planilha, "Taxas");
  return XLSX.write(pasta, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export type ErroLinhaCsv = { linha: number; motivo: string };

export type ResultadoImportacaoCsv = {
  validas: Omit<TaxaFgts, "id" | "atualizadoEm">[];
  erros: ErroLinhaCsv[];
};

export function validarLinhasTaxas(linhas: Record<string, string>[]): ResultadoImportacaoCsv {
  const validas: Omit<TaxaFgts, "id" | "atualizadoEm">[] = [];
  const erros: ErroLinhaCsv[] = [];

  linhas.forEach((linha, indice) => {
    const numeroLinha = indice + 2; // +1 pelo cabeçalho, +1 por índice 0-based
    const instituicao = (linha.instituicao ?? "").trim();
    const plano = (linha.plano ?? "").trim();

    if (!instituicao || instituicao.startsWith("Exemplo")) return;

    // Mesmo sinal de colisão de vírgula decimal com separador de coluna
    // descrito em lib/planilha-maquininhas.ts.
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

    const prazoMaximoAnos = parseNumero(linha.prazo_maximo_anos ?? "");
    if (prazoMaximoAnos === null || prazoMaximoAnos <= 0) {
      erros.push({ linha: numeroLinha, motivo: `Prazo máximo "${linha.prazo_maximo_anos}" inválido.` });
      return;
    }

    validas.push({
      instituicao,
      plano,
      taxaMensal,
      prazoMaximoAnos: Math.round(prazoMaximoAnos),
      fonteUrl: (linha.fonte_url ?? "").trim() || null,
    });
  });

  return { validas, erros };
}
