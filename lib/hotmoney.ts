export type ResultadoHotMoney = {
  valor: number;
  dias: number;
  juros: number;
  totalPagar: number;
};

// Hot money é um empréstimo de curtíssimo prazo, pago de uma vez só no
// vencimento (sem parcelas) - por isso usa juros simples pro-rata pelos
// dias corridos, não a Tabela Price das outras simulações deste site.
export function calcularHotMoney(valor: number, dias: number, taxaMensal: number): ResultadoHotMoney {
  if (valor <= 0 || dias <= 0) {
    return { valor, dias, juros: 0, totalPagar: valor };
  }

  const juros = valor * (taxaMensal / 100) * (dias / 30);
  return { valor, dias, juros, totalPagar: valor + juros };
}
