import type { Metadata } from "next";
import { fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES } from "@/lib/modalidades";

export const metadata: Metadata = {
  title: "Simulador de Crédito Pessoal - taxas reais do Banco Central",
  description:
    "Simule sua parcela de crédito pessoal com taxas médias reportadas ao Banco Central do Brasil. Entenda como funciona, o que é CET e dicas antes de contratar.",
};

export default async function CreditoPessoalPage() {
  const dados = await fetchTaxasDiaria(MODALIDADES.pessoal.nome);

  return (
    <SimuladorModalidade
      titulo="Simulador de crédito pessoal"
      resumo="Simule sua parcela usando taxas de mercado reportadas por instituições financeiras ao Banco Central do Brasil."
      periodoLabel={`Taxas referentes ao período de ${formatarData(dados.inicioPeriodo)} a ${formatarData(dados.fimPeriodo)}.`}
      taxas={dados.taxas}
      mediaAoMes={dados.mediaAoMes}
      mediaAoAno={dados.mediaAoAno}
      tipoIof="pessoaFisica"
    >
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        O que é crédito pessoal?
      </h2>
      <p>
        Crédito pessoal é um empréstimo sem destinação específica: ao
        contrário do financiamento de veículo ou imobiliário, o dinheiro cai
        na conta e pode ser usado para qualquer finalidade. Por não ter uma
        garantia associada (o bem financiado ou o desconto em folha, como no
        consignado), costuma ter as taxas de juros mais altas entre as
        modalidades de crédito para pessoa física - o banco assume mais
        risco de inadimplência.
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Crédito pessoal x crédito consignado
      </h2>
      <p>
        O crédito consignado tem parcelas descontadas diretamente da folha
        de pagamento ou benefício (INSS), o que reduz o risco para o banco e
        resulta em taxas bem menores. Em compensação, só pode ser contratado
        por quem tem vínculo empregatício formal, é servidor público ou
        recebe aposentadoria/pensão do INSS. Quem não se enquadra nesses
        critérios só tem acesso ao crédito pessoal não consignado - a
        modalidade simulada nesta página.
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        O que é CET (Custo Efetivo Total)
      </h2>
      <p>
        A taxa de juros anunciada não é o custo total do empréstimo. O CET
        soma a taxa de juros a tarifas, seguros e outros encargos
        eventualmente cobrados, e é a informação que toda instituição
        financeira é obrigada a apresentar antes da contratação, por
        determinação do Banco Central. As taxas usadas nesta simulação já
        representam o custo efetivo médio por instituição - mas o CET final
        da sua proposta pode variar conforme tarifas específicas do
        contrato, por isso vale sempre conferir o CET informado na proposta
        antes de assinar.
      </p>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dicas antes de contratar
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Compare o CET entre instituições diferentes, não só a taxa de
          juros - duas propostas com a mesma taxa podem ter CET final bem
          diferente por causa de tarifas.
        </li>
        <li>
          Verifique se existe a opção de quitação antecipada com desconto
          proporcional de juros - é um direito garantido por lei.
        </li>
        <li>
          Simule o impacto da parcela no seu orçamento mensal antes de
          contratar, não apenas o valor total do empréstimo.
        </li>
        <li>
          Se você tem vínculo empregatício, é servidor público ou recebe
          benefício do INSS, verifique primeiro as condições do crédito
          consignado - as taxas costumam ser significativamente menores.
        </li>
      </ul>
    </SimuladorModalidade>
  );
}
