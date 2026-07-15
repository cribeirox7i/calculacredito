import type { ReactNode } from "react";
import type { TaxaInstituicao } from "@/lib/bcb";
import { SimuladorInterativo } from "@/components/SimuladorInterativo";

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
        <SimuladorInterativo
          taxas={taxas}
          taxaMediaAoMes={mediaAoMes}
          mediaAoAno={mediaAoAno}
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

      <section className="mt-12 space-y-4 text-zinc-700 dark:text-zinc-300">
        {children}
      </section>
    </main>
  );
}
