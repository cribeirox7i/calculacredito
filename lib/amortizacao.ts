export type ParcelaPrice = {
  numero: number;
  parcela: number;
  juros: number;
  amortizacao: number;
  saldoDevedor: number;
};

export type SimulacaoPrice = {
  parcela: number;
  totalPago: number;
  totalJuros: number;
  parcelas: ParcelaPrice[];
};

// Tabela Price (sistema francês de amortização) — parcelas fixas, padrão de
// mercado para crédito pessoal, consignado e financiamento de veículo no Brasil.
export function simularPrice(
  valor: number,
  taxaAoMesPercentual: number,
  meses: number
): SimulacaoPrice {
  const i = taxaAoMesPercentual / 100;
  const parcela =
    i === 0 ? valor / meses : (valor * i) / (1 - Math.pow(1 + i, -meses));

  let saldoDevedor = valor;
  const parcelas: ParcelaPrice[] = [];

  for (let numero = 1; numero <= meses; numero++) {
    const juros = saldoDevedor * i;
    const amortizacao = parcela - juros;
    saldoDevedor = Math.max(saldoDevedor - amortizacao, 0);
    parcelas.push({ numero, parcela, juros, amortizacao, saldoDevedor });
  }

  const totalPago = parcela * meses;
  const totalJuros = totalPago - valor;

  return { parcela, totalPago, totalJuros, parcelas };
}
