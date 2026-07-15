const BCB_BASE_URL =
  "https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata";

export type TaxaInstituicao = {
  instituicao: string;
  taxaAoMes: number;
  taxaAoAno: number;
  posicao: number;
};

export type TaxasModalidade = {
  modalidade: string;
  inicioPeriodo: string;
  fimPeriodo: string;
  taxas: TaxaInstituicao[];
  mediaAoMes: number;
  mediaAoAno: number;
};

export type TaxasModalidadeMensal = {
  modalidade: string;
  anoMes: string;
  taxas: TaxaInstituicao[];
  mediaAoMes: number;
  mediaAoAno: number;
};

type LinhaDiaria = {
  InicioPeriodo: string;
  FimPeriodo: string;
  Modalidade: string;
  Posicao: number;
  InstituicaoFinanceira: string;
  TaxaJurosAoMes: number;
  TaxaJurosAoAno: number;
};

type LinhaMensal = {
  Mes: string;
  Modalidade: string;
  Posicao: number;
  InstituicaoFinanceira: string;
  TaxaJurosAoMes: number;
  TaxaJurosAoAno: number;
  anoMes: string;
};

// codigoModalidade vem nulo nas linhas de dado da API (só existe populado no
// recurso ParametrosConsulta) — por isso o filtro precisa usar o nome exato
// da modalidade, não o código.
// A API OData do BCB exige espaços como %20 — URLSearchParams codifica como
// "+", o que quebra o parser de $filter no servidor (erro 400). Por isso a
// query string é montada manualmente com encodeURIComponent (que usa %20).
export async function fetchTaxasDiaria(modalidade: string): Promise<TaxasModalidade> {
  const filtro = encodeURIComponent(`Modalidade eq '${modalidade}'`);
  const query = [
    `$filter=${filtro}`,
    `$orderby=${encodeURIComponent("InicioPeriodo desc")}`,
    "$format=json",
    "$top=200",
  ].join("&");

  const url = `${BCB_BASE_URL}/TaxasJurosDiariaPorInicioPeriodo?${query}`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });

  if (!res.ok) {
    throw new Error(`Falha ao consultar taxas do BCB (HTTP ${res.status})`);
  }

  const json = await res.json();
  const linhas = (json.value ?? []) as LinhaDiaria[];

  if (linhas.length === 0) {
    throw new Error(`Nenhuma taxa encontrada para a modalidade "${modalidade}"`);
  }

  // $orderby desc garante que o primeiro registro é do período mais recente.
  const periodoMaisRecente = linhas[0].InicioPeriodo;
  const linhasDoPeriodo = linhas.filter((l) => l.InicioPeriodo === periodoMaisRecente);

  const taxas = linhasDoPeriodo
    .map((l) => ({
      instituicao: l.InstituicaoFinanceira,
      taxaAoMes: l.TaxaJurosAoMes,
      taxaAoAno: l.TaxaJurosAoAno,
      posicao: l.Posicao,
    }))
    // instituições sem taxa reportada no período aparecem como 0.00
    .filter((t) => t.taxaAoMes > 0)
    .sort((a, b) => a.posicao - b.posicao);

  const mediaAoMes = taxas.reduce((soma, t) => soma + t.taxaAoMes, 0) / taxas.length;
  const mediaAoAno = taxas.reduce((soma, t) => soma + t.taxaAoAno, 0) / taxas.length;

  return {
    modalidade,
    inicioPeriodo: linhasDoPeriodo[0].InicioPeriodo,
    fimPeriodo: linhasDoPeriodo[0].FimPeriodo,
    taxas,
    mediaAoMes,
    mediaAoAno,
  };
}

// Financiamento imobiliário só existe no recurso mensal (atualiza uma vez
// por mês, não a cada 5 dias úteis como as outras modalidades).
export async function fetchTaxasMensal(modalidade: string): Promise<TaxasModalidadeMensal> {
  const filtro = encodeURIComponent(`Modalidade eq '${modalidade}'`);
  const query = [
    `$filter=${filtro}`,
    `$orderby=${encodeURIComponent("anoMes desc")}`,
    "$format=json",
    "$top=100",
  ].join("&");

  const url = `${BCB_BASE_URL}/TaxasJurosMensalPorMes?${query}`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });

  if (!res.ok) {
    throw new Error(`Falha ao consultar taxas do BCB (HTTP ${res.status})`);
  }

  const json = await res.json();
  const linhas = (json.value ?? []) as LinhaMensal[];

  if (linhas.length === 0) {
    throw new Error(`Nenhuma taxa encontrada para a modalidade "${modalidade}"`);
  }

  // $orderby desc garante que o primeiro registro é do mês mais recente.
  const mesMaisRecente = linhas[0].anoMes;
  const linhasDoMes = linhas.filter((l) => l.anoMes === mesMaisRecente);

  const taxas = linhasDoMes
    .map((l) => ({
      instituicao: l.InstituicaoFinanceira,
      taxaAoMes: l.TaxaJurosAoMes,
      taxaAoAno: l.TaxaJurosAoAno,
      posicao: l.Posicao,
    }))
    .filter((t) => t.taxaAoMes > 0)
    .sort((a, b) => a.posicao - b.posicao);

  const mediaAoMes = taxas.reduce((soma, t) => soma + t.taxaAoMes, 0) / taxas.length;
  const mediaAoAno = taxas.reduce((soma, t) => soma + t.taxaAoAno, 0) / taxas.length;

  return {
    modalidade,
    anoMes: mesMaisRecente,
    taxas,
    mediaAoMes,
    mediaAoAno,
  };
}
