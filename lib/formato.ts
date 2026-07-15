export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatarMesAno(anoMes: string): string {
  const [ano, mes] = anoMes.split("-");
  const nomeMes = MESES[Number(mes) - 1] ?? mes;
  return `${nomeMes} de ${ano}`;
}
