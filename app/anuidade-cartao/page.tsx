import type { Metadata } from "next";
import { obterTaxasCartaoAnuidade } from "@/lib/taxas-cartao-anuidade";
import { SimuladorCartaoAnuidade } from "@/components/SimuladorCartaoAnuidade";

export const metadata: Metadata = {
  title: "Comparador de Anuidade de Cartão de Crédito",
  description:
    "Compare a anuidade e os principais benefícios dos cartões de crédito das principais instituições e descubra qual vale a pena pagar.",
};

export default async function AnuidadeCartaoPage() {
  const taxas = await obterTaxasCartaoAnuidade();

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Comparador de anuidade de cartão de crédito
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Compare quanto cada instituição cobra de anuidade e quais benefícios
        vêm junto com cada cartão.
      </p>

      <div className="mt-8">
        <SimuladorCartaoAnuidade taxas={taxas} />
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Este site não é uma instituição financeira, não emite cartões e não
        coleta dados pessoais. Os valores mostrados são anunciados
        publicamente pelas próprias instituições e cadastrados manualmente
        neste site - não são uma média oficial de mercado (diferente das
        simulações de crédito deste site, que usam dados do Banco Central;
        anuidade não é um dado reportado oficialmente ao BC). Condições de
        isenção e benefícios podem mudar sem aviso - confirme direto com a
        instituição antes de decidir.
      </p>

      <section className="mt-12 space-y-4 text-zinc-700 dark:text-zinc-300">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é a anuidade do cartão
        </h2>
        <p>
          É a taxa cobrada pela instituição para manter o cartão de crédito
          ativo, geralmente lançada uma vez por ano (algumas cobram em
          parcelas mensais). Cartões mais simples costumam ter anuidade
          gratuita ou baixa; cartões com programa de pontos, milhas, seguros e
          acesso a salas VIP costumam cobrar mais, na expectativa de que os
          benefícios compensem o custo pra quem usa bastante.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Como negociar a isenção
        </h2>
        <p>
          Muitas instituições isentam a anuidade automaticamente a partir de
          um valor mínimo de gasto mensal ou anual na fatura - condição que
          varia bastante de banco pra banco e pode mudar sem aviso. Vale
          também ligar pra central de relacionamento e negociar diretamente,
          principalmente se você é cliente antigo ou está pensando em
          cancelar o cartão.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Quando vale a pena pagar anuidade
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Se os benefícios (milhas, cashback, seguros, salas VIP) que você
            realmente usa valem mais do que o valor da anuidade no ano, o
            cartão pago pode compensar - faça essa conta antes de decidir.
          </li>
          <li>
            Se você usa o cartão só ocasionalmente ou não aproveita os
            benefícios extras, um cartão com anuidade gratuita costuma ser a
            opção mais econômica.
          </li>
          <li>
            Compare sempre o custo total do ano (anuidade menos qualquer
            isenção que você se qualifique) e não só o valor anunciado na
            tabela do banco.
          </li>
        </ul>
      </section>
    </main>
  );
}
