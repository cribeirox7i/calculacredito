import type { Metadata } from "next";
import { fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES } from "@/lib/modalidades";

export const metadata: Metadata = {
  title: "Simulador de Financiamento de Veículo - taxas reais do Banco Central",
  description:
    "Simule o financiamento do seu carro ou moto com taxas médias reportadas ao Banco Central do Brasil. Entenda CDC, leasing e dicas antes de fechar negócio.",
};

export default async function FinanciamentoVeiculoPage() {
  const dados = await fetchTaxasDiaria(MODALIDADES.veiculo.nome);

  return (
    <SimuladorModalidade
      titulo="Simulador de financiamento de veículo"
      resumo="Simule a parcela do financiamento do seu carro ou moto usando taxas de mercado reportadas ao Banco Central do Brasil."
      periodoLabel={`Taxas referentes ao período de ${formatarData(dados.inicioPeriodo)} a ${formatarData(dados.fimPeriodo)}.`}
      taxas={dados.taxas}
      mediaAoMes={dados.mediaAoMes}
      mediaAoAno={dados.mediaAoAno}
      valorInicial={40000}
      mesesInicial={48}
      tipoIof="pessoaFisica"
    >
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Como funciona o financiamento de veículo
      </h2>
      <p>
        Na modalidade mais comum, o CDC (Crédito Direto ao Consumidor), o
        banco paga a concessionária ou o vendedor à vista e você paga o banco
        em parcelas fixas. O próprio veículo fica alienado fiduciariamente:
        ele é a garantia do contrato, e por isso as taxas de financiamento de
        veículo são bem menores que as de crédito pessoal - o risco de
        inadimplência para o banco é menor, já que ele pode retomar o bem em
        caso de não pagamento.
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        CDC x leasing
      </h2>
      <p>
        Além do CDC, existe o arrendamento mercantil (leasing), em que
        formalmente o banco é o dono do veículo até o fim do contrato e você
        paga por seu uso, com opção de compra ao final. Na prática, para
        pessoa física, o CDC é hoje a modalidade dominante - o leasing perdeu
        espaço depois de mudanças tributárias e é mais comum em contratos de
        pessoa jurídica (frotas).
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        O que observar além da taxa de juros
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Valor de entrada</strong>: quanto maior a entrada, menor o
          valor financiado e menor o total pago em juros - vale simular
          diferentes valores de entrada antes de decidir.
        </li>
        <li>
          <strong>Tarifas do contrato</strong>: taxa de registro do contrato e
          gravame eletrônico (o registro da alienação do veículo em nome do
          banco) costumam ser cobrados à parte e entram no CET.
        </li>
        <li>
          <strong>Seguro prestamista</strong>: alguns contratos embutem um
          seguro que quita o saldo devedor em caso de morte ou invalidez do
          contratante - verifique se ele é obrigatório ou opcional na
          proposta.
        </li>
        <li>
          <strong>Prazo x vida útil do bem</strong>: financiar por prazos
          muito longos (72 meses ou mais) reduz a parcela, mas aumenta o
          risco de o carro valer menos que o saldo devedor lá na frente
          (ficar &ldquo;no negativo&rdquo;).
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dicas antes de fechar negócio
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Simule o financiamento em mais de um banco, não só o financeiro da
          concessionária - a diferença de taxa entre instituições pode ser
          grande, como mostra a tabela abaixo.
        </li>
        <li>
          Confira sempre o CET, não apenas a taxa de juros anunciada.
        </li>
        <li>
          Avalie se compensa dar uma entrada maior em vez de financiar o
          valor total - o custo do dinheiro parado costuma ser menor que o
          juro do financiamento.
        </li>
      </ul>
    </SimuladorModalidade>
  );
}
