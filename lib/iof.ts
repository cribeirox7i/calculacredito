import iofConfig from "@/lib/iof.json";

export type TipoIof = "pessoaFisica" | "pessoaJuridica" | "isento";

type AliquotaIof = { taxaDiariaPercentual: number; taxaFixaPercentual: number; tetoDias: number };

// Aproximação: aplica a taxa diária sobre o valor principal (não sobre o
// saldo devedor amortizando dia a dia) - é como a maioria das explicações
// públicas de IOF descreve o cálculo, e é consistente com o teto de 3,38%
// (PF) ser sempre citado como percentual sobre o valor total da operação,
// não sobre uma média ponderada do saldo. Prazo em dias aproximado por
// meses × 30, limitado ao teto de 365 dias do imposto.
export function calcularIof(valor: number, meses: number, tipo: TipoIof): number {
  if (tipo === "isento" || valor <= 0 || meses <= 0) return 0;

  const config = iofConfig[tipo] as AliquotaIof;
  const dias = Math.min(Math.round(meses * 30), config.tetoDias);
  const iofDiario = valor * (config.taxaDiariaPercentual / 100) * dias;
  const iofFixo = valor * (config.taxaFixaPercentual / 100);
  return iofDiario + iofFixo;
}

export const IOF_FONTE = iofConfig.fonte;
