// Antecipação do saque-aniversário: o banco paga hoje o valor presente das
// parcelas anuais futuras, descontadas mês a mês pela taxa da instituição -
// mesma lógica de desconto composto de um financiamento, só que "ao
// contrário" (você recebe o valor descontado em vez de pagar parcelas).
export function calcularValorPresenteFgts(parcelaAnual: number, anos: number, taxaMensal: number): number {
  if (parcelaAnual <= 0 || anos <= 0) return 0;

  let total = 0;
  for (let ano = 1; ano <= anos; ano++) {
    total += parcelaAnual / Math.pow(1 + taxaMensal / 100, ano * 12);
  }
  return total;
}
