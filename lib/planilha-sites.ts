import Papa from "papaparse";
import * as XLSX from "xlsx";

const CABECALHO = ["cnpj8", "site"] as const;
const EXEMPLO = { cnpj8: "12345678", site: "https://www.banco-exemplo.com.br" };

function normalizarUrl(url: string): string {
  const limpa = url.trim();
  return /^https?:\/\//i.test(limpa) ? limpa : `https://${limpa}`;
}

function linhasParaModelo(sitesAtuais: Record<string, string>) {
  return Object.keys(sitesAtuais).length > 0
    ? Object.entries(sitesAtuais)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cnpj8, site]) => ({ cnpj8, site }))
    : [EXEMPLO];
}

// BOM no início garante que o Excel abra como UTF-8 (não ANSI) ao dar
// duplo-clique no arquivo.
export function gerarCsvModeloSites(sitesAtuais: Record<string, string>): string {
  return "﻿" + Papa.unparse({ fields: [...CABECALHO], data: linhasParaModelo(sitesAtuais) }, { delimiter: ";" });
}

export function gerarXlsxModeloSites(sitesAtuais: Record<string, string>): Buffer {
  const planilha = XLSX.utils.json_to_sheet(linhasParaModelo(sitesAtuais), { header: [...CABECALHO] });
  const pasta = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(pasta, planilha, "Sites");
  return XLSX.write(pasta, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export type ErroLinhaCsvSites = { linha: number; motivo: string };

export type ResultadoImportacaoCsvSites = {
  validas: { cnpj8: string; site: string }[];
  erros: ErroLinhaCsvSites[];
};

export function validarLinhasSites(linhas: Record<string, string>[]): ResultadoImportacaoCsvSites {
  const validas: { cnpj8: string; site: string }[] = [];
  const erros: ErroLinhaCsvSites[] = [];

  linhas.forEach((linha, indice) => {
    const numeroLinha = indice + 2;
    const cnpj8 = (linha.cnpj8 ?? "").trim();
    const site = (linha.site ?? "").trim();

    if (!cnpj8 && !site) return;

    // Papaparse marca "__parsed_extra" quando a linha tem mais campos que o
    // cabeçalho - sinal de que uma vírgula dentro de algum valor colidiu com
    // o separador de coluna do CSV.
    if ("__parsed_extra" in linha) {
      erros.push({
        linha: numeroLinha,
        motivo: "Linha com mais colunas do que o esperado - verifique se algum valor tem vírgula sem estar entre aspas.",
      });
      return;
    }

    // Só pula se bater os DOIS campos do placeholder do modelo vazio - um
    // CNPJ8 real de 8 dígitos que coincidisse só com "12345678" não pode
    // ser descartado silenciosamente.
    if (cnpj8 === EXEMPLO.cnpj8 && site === EXEMPLO.site) return;

    if (!/^\d{8}$/.test(cnpj8)) {
      erros.push({ linha: numeroLinha, motivo: `CNPJ8 "${cnpj8}" inválido (precisa de 8 dígitos).` });
      return;
    }
    if (!site) {
      erros.push({ linha: numeroLinha, motivo: "Coluna 'site' vazia." });
      return;
    }

    validas.push({ cnpj8, site: normalizarUrl(site) });
  });

  return { validas, erros };
}
