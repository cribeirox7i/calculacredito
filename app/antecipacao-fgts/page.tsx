import type { Metadata } from "next";
import Link from "next/link";
import { obterTaxasFgts } from "@/lib/taxas-fgts";
import { SimuladorFgtsAntecipacao } from "@/components/SimuladorFgtsAntecipacao";

export const metadata: Metadata = {
  title: "Antecipação do Saque-Aniversário FGTS - compare instituições",
  description:
    "Compare quanto cada instituição paga hoje para antecipar as parcelas futuras do seu saque-aniversário do FGTS.",
};

export default async function AntecipacaoFgtsPage() {
  const taxas = await obterTaxasFgts();

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Antecipação do saque-aniversário FGTS
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Compare quanto cada instituição paga hoje para antecipar as próximas
        parcelas do seu saque-aniversário do FGTS.
      </p>

      <div className="mt-8">
        <SimuladorFgtsAntecipacao taxas={taxas} />
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Este site não é uma instituição financeira, não movimenta valores e
        não coleta dados pessoais. As taxas mostradas são anunciadas
        publicamente pelas próprias instituições e cadastradas manualmente
        neste site - não são uma média oficial de mercado. Antes de aderir ao
        saque-aniversário, veja também nossa{" "}
        <Link href="/saque-aniversario" className="underline">
          calculadora de saque-aniversário
        </Link>
        .
      </p>

      <section className="mt-12 space-y-4 text-zinc-700 dark:text-zinc-300">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é a antecipação do saque-aniversário
        </h2>
        <p>
          Quem aderiu ao{" "}
          <Link href="/saque-aniversario" className="underline">
            saque-aniversário do FGTS
          </Link>{" "}
          pode contratar com um banco a antecipação de uma ou mais parcelas
          futuras: em vez de esperar o valor cair na conta a cada aniversário,
          você recebe hoje um valor à vista, e o banco fica com o direito de
          receber diretamente da Caixa as parcelas anuais correspondentes nos
          anos seguintes, até quitar o valor antecipado.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Como o valor é calculado
        </h2>
        <p>
          Cada instituição aplica uma taxa de juros mensal sobre o valor das
          parcelas futuras, descontando o tempo de espera de cada uma delas -
          quanto mais distante a parcela, maior o desconto aplicado. É
          essencialmente um empréstimo com garantia nas parcelas futuras do
          FGTS: o valor líquido que você recebe hoje é sempre menor que a soma
          das parcelas futuras, e a diferença é o custo da antecipação.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Vale a pena antecipar?
        </h2>
        <p>
          Antecipar tem custo - normalmente vale a pena só quando você tem uma
          necessidade imediata de dinheiro e as alternativas de crédito
          disponíveis (como crédito pessoal ou consignado) saem mais caras que
          a taxa oferecida pela antecipação. Se você não tem uma necessidade
          urgente, esperar o valor cair naturalmente a cada aniversário evita
          pagar esse custo.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de contratar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Compare sempre o valor líquido recebido hoje entre instituições
            diferentes, não só a taxa mensal anunciada - o prazo antecipado
            também muda o resultado final.
          </li>
          <li>
            Simule o cenário sem antecipar (valor total das parcelas ao longo
            dos anos) para enxergar exatamente quanto a antecipação está
            custando.
          </li>
          <li>
            Lembre que, uma vez comprometidas com um banco, as parcelas
            antecipadas não ficam mais disponíveis para você - elas vão
            direto para a instituição até quitar o valor adiantado.
          </li>
          <li>
            Verifique se a instituição escolhida realmente opera de forma
            homologada junto à Caixa antes de fornecer qualquer dado pessoal.
          </li>
        </ul>
      </section>
    </main>
  );
}
