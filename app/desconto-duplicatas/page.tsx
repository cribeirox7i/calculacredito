import type { Metadata } from "next";
import { fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES_PJ } from "@/lib/modalidades";

export const metadata: Metadata = {
  title: "Simulador de Desconto de Duplicatas — taxas reais do Banco Central",
  description:
    "Simule a antecipação de recebíveis (desconto de duplicatas) da sua empresa com taxas médias reportadas ao Banco Central do Brasil.",
};

export default async function DescontoDuplicatasPage() {
  const dados = await fetchTaxasDiaria(MODALIDADES_PJ.descontoDuplicatas.nome);

  return (
    <SimuladorModalidade
      titulo="Simulador de desconto de duplicatas"
      resumo="Simule a antecipação de recebíveis da sua empresa usando taxas de mercado reportadas ao Banco Central do Brasil."
      periodoLabel={`Taxas referentes ao período de ${formatarData(dados.inicioPeriodo)} a ${formatarData(dados.fimPeriodo)}.`}
      taxas={dados.taxas}
      mediaAoMes={dados.mediaAoMes}
      mediaAoAno={dados.mediaAoAno}
      valorInicial={20000}
      mesesInicial={3}
      disclaimerExtra="Linha de crédito voltada a pessoas jurídicas — não confundir com as modalidades de crédito para pessoa física."
    >
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        O que é desconto de duplicatas
      </h2>
      <p>
        A empresa que vende a prazo pode antecipar o recebimento dessas
        vendas — representadas por duplicatas — junto ao banco, recebendo o
        valor à vista com desconto dos juros pelo período antecipado. É uma
        forma de melhorar o caixa sem esperar o prazo original de pagamento
        do cliente.
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Quando faz sentido usar
      </h2>
      <p>
        Faz sentido quando o custo de antecipar (a taxa de desconto) é menor
        que o benefício de ter o dinheiro em caixa agora — para pagar
        fornecedores com desconto à vista, por exemplo, ou para evitar outra
        linha de crédito mais cara. Como a garantia da operação são os
        próprios recebíveis, as taxas tendem a ser menores que as de capital
        de giro sem garantia.
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dicas antes de contratar
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Compare a taxa de desconto entre bancos diferentes — a diferença de
          custo por essa antecipação pode variar bastante entre
          instituições.
        </li>
        <li>
          Avalie o risco de inadimplência do cliente antes de antecipar: em
          geral, se o cliente não pagar a duplicata, a empresa continua
          responsável pelo valor antecipado perante o banco.
        </li>
        <li>
          Negocie a taxa com base no volume e na recorrência das
          antecipações — clientes com fluxo constante costumam conseguir
          condições melhores.
        </li>
      </ul>
    </SimuladorModalidade>
  );
}
