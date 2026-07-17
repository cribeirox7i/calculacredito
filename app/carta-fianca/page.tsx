import type { Metadata } from "next";
import { obterTaxasCartaFianca } from "@/lib/taxas-carta-fianca";
import { SimuladorCartaFianca } from "@/components/SimuladorCartaFianca";

export const metadata: Metadata = {
  title: "Simulador de Carta Fiança - compare taxas",
  description:
    "Compare a taxa anual cobrada por cada instituição para emitir uma carta fiança e veja o custo total do contrato.",
};

export default async function CartaFiancaPage() {
  const taxas = await obterTaxasCartaFianca();

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Simulador de carta fiança
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Compare a taxa anual cobrada por cada instituição para emitir a
        garantia e veja o custo total ao longo do contrato.
      </p>

      <div className="mt-8">
        <SimuladorCartaFianca taxas={taxas} />
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Este site não é uma instituição financeira, não emite garantias e não
        coleta dados pessoais. As taxas mostradas são anunciadas publicamente
        pelas próprias instituições e cadastradas manualmente neste site - não
        são uma média oficial de mercado (carta fiança não é uma modalidade de
        crédito reportada ao Banco Central, já que não é um empréstimo). A
        taxa real depende da sua análise de crédito e das garantias adicionais
        exigidas pelo banco.
      </p>

      <section className="mt-12 space-y-4 text-zinc-700 dark:text-zinc-300">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é carta fiança
        </h2>
        <p>
          Carta fiança (ou fiança bancária) é uma garantia emitida por um
          banco em nome da sua empresa, comprometendo-se a pagar um terceiro
          (um locador, um cliente de uma licitação, um fornecedor) caso a
          empresa não cumpra uma obrigação contratual. Não é um empréstimo -
          nenhum valor é liberado para a empresa - por isso não entra nas
          modalidades de crédito reportadas ao Banco Central.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Onde costuma ser exigida
        </h2>
        <p>
          É comum em contratos de aluguel comercial (como alternativa ao
          depósito caução ou ao seguro-fiança), em licitações e contratos
          públicos (como garantia de execução) e em contratos entre empresas
          que exigem uma garantia financeira de uma das partes.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Como a taxa é cobrada
        </h2>
        <p>
          O banco cobra uma taxa anual sobre o valor total garantido,
          prorrateada pelo tempo de vigência do contrato - diferente de um
          empréstimo, não há juros compostos nem parcelas de amortização. Além
          da taxa, o banco normalmente exige contragarantias da empresa (como
          um imóvel, aplicação financeira ou aval dos sócios) antes de emitir
          a carta.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de contratar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Pergunte quais contragarantias o banco vai exigir antes de
            comparar só a taxa anual - elas variam bastante entre
            instituições e podem pesar mais que a diferença de taxa.
          </li>
          <li>
            Confirme se a taxa é cobrada de uma vez no início do contrato ou
            periodicamente (anual, por exemplo) - isso muda o fluxo de caixa
            da sua empresa.
          </li>
          <li>
            Verifique o prazo de emissão - carta fiança para licitações
            costuma ter prazo apertado, vale negociar com antecedência.
          </li>
        </ul>
      </section>
    </main>
  );
}
