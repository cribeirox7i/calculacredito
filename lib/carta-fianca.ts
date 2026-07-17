export type ResultadoCartaFianca = {
  valor: number;
  meses: number;
  custoTotal: number;
  custoAoAno: number;
};

// Carta fiança não é um empréstimo - é uma garantia, cobrada como uma taxa
// de serviço anual sobre o valor garantido, proporcional ao tempo de
// vigência do contrato (sem juros compostos, diferente das simulações de
// crédito deste site).
export function calcularCartaFianca(valor: number, meses: number, taxaAnual: number): ResultadoCartaFianca {
  if (valor <= 0 || meses <= 0) {
    return { valor, meses, custoTotal: 0, custoAoAno: 0 };
  }

  const custoAoAno = valor * (taxaAnual / 100);
  const custoTotal = custoAoAno * (meses / 12);
  return { valor, meses, custoTotal, custoAoAno };
}
