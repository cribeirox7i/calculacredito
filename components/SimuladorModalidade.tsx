import type { ReactNode } from "react";
import type { TaxaInstituicao } from "@/lib/bcb";
import { obterLogosPorCnpj8 } from "@/lib/logos";
import { obterSitesPorCnpj8 } from "@/lib/sites";
import { SimuladorInterativo } from "@/components/SimuladorInterativo";

export async function SimuladorModalidade({
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
  const [logosPorCnpj8, sitesPorCnpj8] = await Promise.all([
    obterLogosPorCnpj8(),
    obterSitesPorCnpj8(),
  ]);

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
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
          logosPorCnpj8={logosPorCnpj8}
          sitesPorCnpj8={sitesPorCnpj8}
        />
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Este site não é uma instituição financeira, não oferece crédito e não
        coleta dados pessoais. Os valores simulados são estimativas baseadas em
        médias de mercado publicadas pelo Banco Central - não são uma oferta e
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
