import type { ReactNode } from "react";
import type { TaxaInstituicao } from "@/lib/bcb";
import { CalculadoraCredito } from "@/components/CalculadoraCredito";

export function SimuladorModalidade({
  titulo,
  resumo,
  periodoLabel,
  taxas,
  mediaAoMes,
  mediaAoAno,
  valorInicial,
  mesesInicial,
  disclaimerExtra,
  children,
}: {
  titulo: string;
  resumo: string;
  periodoLabel: string;
  taxas: TaxaInstituicao[];
  mediaAoMes: number;
  mediaAoAno: number;
  valorInicial?: number;
  mesesInicial?: number;
  disclaimerExtra?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {titulo}
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        {resumo} {periodoLabel}
      </p>

      <div className="mt-8">
        <CalculadoraCredito
          taxaMediaAoMes={mediaAoMes}
          valorInicial={valorInicial}
          mesesInicial={mesesInicial}
        />
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Este site não é uma instituição financeira, não oferece crédito e não
        coleta dados pessoais. Os valores simulados são estimativas baseadas em
        médias de mercado publicadas pelo Banco Central — não são uma oferta e
        não substituem a proposta formal de uma instituição financeira, que
        deve incluir o Custo Efetivo Total (CET) real da operação.
        {disclaimerExtra ? ` ${disclaimerExtra}` : ""}
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Taxas médias por instituição
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Média geral do mercado no período: {mediaAoMes.toFixed(2)}% ao mês (
          {mediaAoAno.toFixed(2)}% ao ano). Abaixo, as instituições com as
          menores taxas reportadas.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Instituição</th>
                <th className="px-4 py-2 font-medium">% ao mês</th>
                <th className="px-4 py-2 font-medium">% ao ano</th>
              </tr>
            </thead>
            <tbody>
              {taxas.slice(0, 20).map((t) => (
                <tr key={t.instituicao} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{t.posicao}</td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{t.instituicao}</td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{t.taxaAoMes.toFixed(2)}%</td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{t.taxaAoAno.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Fonte:{" "}
          <a
            href="https://dadosabertos.bcb.gov.br/dataset/taxas-de-juros-de-operacoes-de-credito"
            className="underline"
          >
            Portal de Dados Abertos do Banco Central do Brasil
          </a>
          . As taxas já incluem os encargos médios da operação, ponderados
          pelo valor contratado em cada instituição.
        </p>
      </section>

      <section className="mt-12 space-y-4 text-zinc-700 dark:text-zinc-300">
        {children}
      </section>
    </main>
  );
}
