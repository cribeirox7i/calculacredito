import tabela from "@/lib/saque-aniversario.json";

export type FaixaSaqueAniversario = { ate: number | null; aliquota: number; parcelaAdicional: number };

export type ResultadoSaqueAniversario = {
  saldo: number;
  faixaIndice: number;
  aliquota: number;
  parcelaAdicional: number;
  valorSaque: number;
  saldoRemanescente: number;
};

const FAIXAS = tabela.faixas as FaixaSaqueAniversario[];

function indiceFaixa(saldo: number): number {
  const indice = FAIXAS.findIndex((f) => f.ate === null || saldo <= f.ate);
  return indice === -1 ? FAIXAS.length - 1 : indice;
}

export function calcularSaqueAniversario(saldo: number): ResultadoSaqueAniversario {
  const saldoValido = Math.max(saldo, 0);
  const faixa = FAIXAS[indiceFaixa(saldoValido)];
  const valorSaque = saldoValido <= 0 ? 0 : Math.min(saldoValido, saldoValido * (faixa.aliquota / 100) + faixa.parcelaAdicional);
  return {
    saldo: saldoValido,
    faixaIndice: indiceFaixa(saldoValido),
    aliquota: faixa.aliquota,
    parcelaAdicional: faixa.parcelaAdicional,
    valorSaque,
    saldoRemanescente: saldoValido - valorSaque,
  };
}

export const SAQUE_ANIVERSARIO_FONTE = tabela.fonte;
export const SAQUE_ANIVERSARIO_FAIXAS = FAIXAS;
