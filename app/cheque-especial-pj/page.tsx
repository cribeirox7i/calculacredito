import type { Metadata } from "next";
import { fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES_PJ } from "@/lib/modalidades";

export const metadata: Metadata = {
  title: "Simulador de Cheque Especial PJ - taxas reais do Banco Central",
  description:
    "Simule o cheque especial da sua empresa com taxas médias reportadas ao Banco Central do Brasil.",
};

export default async function ChequeEspecialPjPage() {
  const dados = await fetchTaxasDiaria(MODALIDADES_PJ.chequeEspecial.nome);

  return (
    <SimuladorModalidade
      titulo="Simulador de cheque especial PJ"
      resumo="Simule o uso do cheque especial da sua empresa usando taxas de mercado reportadas ao Banco Central do Brasil."
      periodoLabel={`Taxas referentes ao período de ${formatarData(dados.inicioPeriodo)} a ${formatarData(dados.fimPeriodo)}.`}
      taxas={dados.taxas}
      mediaAoMes={dados.mediaAoMes}
      mediaAoAno={dados.mediaAoAno}
      valorInicial={10000}
      mesesInicial={3}
      tipoIof="pessoaJuridica"
      disclaimerExtra="Linha de crédito voltada a pessoas jurídicas - não confundir com as modalidades de crédito para pessoa física."
    >
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        O que é cheque especial PJ
      </h2>
      <p>
        É um limite de crédito emergencial vinculado à conta corrente da
        empresa, liberado automaticamente quando o saldo fica negativo.
        Diferente da conta garantida (que costuma ter contratação e limite
        formalizados à parte), o cheque especial PJ normalmente já vem
        embutido na conta e é acionado sem burocracia - o que também explica
        por que costuma ter as taxas mais altas entre as modalidades de
        crédito PJ.
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Quando faz sentido usar
      </h2>
      <p>
        Por ter custo elevado, o cheque especial PJ deve ser reservado para
        emergências de curtíssimo prazo - cobrir um pagamento inesperado por
        alguns dias, por exemplo - e nunca como fonte contínua de crédito
        para a operação da empresa.
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dicas antes de usar
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Quite o valor utilizado assim que possível - os juros dessa
          modalidade se acumulam rapidamente por serem cobrados ao dia.
        </li>
        <li>
          Se a necessidade de crédito se repetir todo mês, procure uma linha
          de capital de giro ou conta garantida, normalmente bem mais
          baratas.
        </li>
        <li>
          Compare as taxas entre instituições - mesmo dentro do cheque
          especial PJ, a diferença de custo entre bancos pode ser grande.
        </li>
      </ul>
    </SimuladorModalidade>
  );
}
