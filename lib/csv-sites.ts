import Papa from "papaparse";

const CABECALHO = ["cnpj8", "site"] as const;

function normalizarUrl(url: string): string {
  const limpa = url.trim();
  return /^https?:\/\//i.test(limpa) ? limpa : `https://${limpa}`;
}

export function gerarCsvModeloSites(sitesAtuais: Record<string, string>): string {
  const linhas =
    Object.keys(sitesAtuais).length > 0
      ? Object.entries(sitesAtuais)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([cnpj8, site]) => ({ cnpj8, site }))
      : [{ cnpj8: "12345678", site: "https://www.banco-exemplo.com.br" }];

  return Papa.unparse({ fields: [...CABECALHO], data: linhas });
}

export type ErroLinhaCsvSites = { linha: number; motivo: string };

export type ResultadoImportacaoCsvSites = {
  validas: { cnpj8: string; site: string }[];
  erros: ErroLinhaCsvSites[];
};

export function parseCsvSites(conteudoCsv: string): ResultadoImportacaoCsvSites {
  const { data } = Papa.parse<Record<string, string>>(conteudoCsv, {
    header: true,
    skipEmptyLines: true,
  });

  const validas: { cnpj8: string; site: string }[] = [];
  const erros: ErroLinhaCsvSites[] = [];

  data.forEach((linha, indice) => {
    const numeroLinha = indice + 2;
    const cnpj8 = (linha.cnpj8 ?? "").trim();
    const site = (linha.site ?? "").trim();

    if (!cnpj8 && !site) return;
    // Só pula se bater os DOIS campos do placeholder do modelo vazio - um
    // CNPJ8 real de 8 dígitos que coincidisse só com "12345678" não pode
    // ser descartado silenciosamente.
    if (cnpj8 === "12345678" && site === "https://www.banco-exemplo.com.br") return;

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
