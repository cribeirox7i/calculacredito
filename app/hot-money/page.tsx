import type { Metadata } from "next";
import { obterTaxasHotMoney } from "@/lib/taxas-hotmoney";
import { SimuladorHotMoney } from "@/components/SimuladorHotMoney";

export const metadata: Metadata = {
  title: "Simulador de Hot Money - compare taxas",
  description:
    "Compare as taxas de hot money (empréstimo de curtíssimo prazo para empresas) entre as principais instituições e veja quanto você paga no vencimento.",
};

export default async function HotMoneyPage() {
  const taxas = await obterTaxasHotMoney();

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Simulador de hot money
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Compare quanto cada instituição cobra para emprestar dinheiro à sua
        empresa por poucos dias e veja o total a pagar no vencimento.
      </p>

      <div className="mt-8">
        <SimuladorHotMoney taxas={taxas} />
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Este site não é uma instituição financeira, não oferece crédito e não
        coleta dados pessoais. As taxas mostradas são anunciadas publicamente
        pelas próprias instituições e cadastradas manualmente neste site - não
        são uma média oficial de mercado (diferente das simulações de crédito
        deste site que usam dados do Banco Central, hot money não é uma
        modalidade reportada oficialmente ao BC). A taxa real da sua conta
        depende da sua análise de crédito.
      </p>

      <section className="mt-12 space-y-4 text-zinc-700 dark:text-zinc-300">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é hot money
        </h2>
        <p>
          Hot money é um empréstimo de curtíssimo prazo para empresas -
          geralmente de 1 a 29 dias, podendo chegar a alguns meses em alguns
          bancos - usado para cobrir uma necessidade pontual de caixa até a
          entrada de um recebível esperado. Diferente do capital de giro
          tradicional, não é parcelado: você recebe o valor e paga tudo de uma
          vez só, principal mais juros, no vencimento combinado.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Por que a taxa costuma ser mais alta
        </h2>
        <p>
          Por ser um crédito liberado rapidamente, sem muita análise
          aprofundada e por prazo muito curto, o hot money costuma ter a taxa
          mensal mais alta entre as linhas de capital de giro - o banco cobra
          esse prêmio pela agilidade e pelo risco de um crédito quase sem
          garantias formais. Vale a pena principalmente quando a alternativa é
          ficar no cheque especial ou atrasar um pagamento importante.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Hot money x capital de giro
        </h2>
        <p>
          Se a necessidade de caixa for recorrente ou de prazo mais longo,
          vale considerar uma linha de capital de giro tradicional, com
          parcelas e taxas geralmente menores. O hot money existe pra
          resolver um descasamento pontual e de curtíssimo prazo - usá-lo como
          fonte de crédito contínua tende a sair caro.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de contratar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Confirme a data exata do vencimento e garanta que o recebível
            esperado vai cair na conta antes dela - um atraso pode gerar
            multa e juros adicionais.
          </li>
          <li>
            Compare o custo total (não só a taxa mensal) com outras opções de
            crédito de curto prazo, como antecipação de recebíveis.
          </li>
          <li>
            Negocie: por ser um crédito de relacionamento, muitos bancos
            oferecem taxa melhor para clientes com bom histórico.
          </li>
        </ul>
      </section>
    </main>
  );
}
