"use client";

import { useMemo, useState } from "react";
import type { TaxaInstituicao } from "@/lib/bcb";
import { simularPrice } from "@/lib/amortizacao";
import { corAvatar, iniciaisInstituicao, slugify } from "@/lib/logos";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const LIMITE_PADRAO = 20;

export function SimuladorInterativo({
  taxas,
  taxaMediaAoMes,
  mediaAoAno,
  valorInicial = 5000,
  mesesInicial = 24,
  logosPorSlug = {},
}: {
  taxas: TaxaInstituicao[];
  taxaMediaAoMes: number;
  mediaAoAno: number;
  valorInicial?: number;
  mesesInicial?: number;
  logosPorSlug?: Record<string, string>;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [meses, setMeses] = useState(mesesInicial);
  const [taxa, setTaxa] = useState(Number(taxaMediaAoMes.toFixed(2)));
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const resultado = useMemo(() => {
    if (valor <= 0 || meses <= 0 || taxa <= 0) return null;
    return simularPrice(valor, taxa, meses);
  }, [valor, meses, taxa]);

  const taxasExibidas = mostrarTodos ? taxas : taxas.slice(0, LIMITE_PADRAO);
  const restantes = taxas.length - LIMITE_PADRAO;

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Valor desejado
            <input
              type="number"
              min={1}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Prazo (meses)
            <input
              type="number"
              min={1}
              max={360}
              value={meses}
              onChange={(e) => setMeses(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Taxa de juros (% ao mês)
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={taxa}
              onChange={(e) => setTaxa(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Taxa pré-preenchida com a média das instituições financeiras reportada
          ao Banco Central no período mais recente. A taxa que você vai conseguir
          depende do seu perfil de crédito — ajuste o campo acima para simular
          outros cenários.
        </p>

        {resultado && (
          <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-3 dark:border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Parcela mensal</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(resultado.parcela)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total pago ao final</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(resultado.totalPago)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total de juros</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(resultado.totalJuros)}
              </p>
            </div>
          </div>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Taxas médias por instituição
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Média geral do mercado no período: {taxaMediaAoMes.toFixed(2)}% ao mês (
          {mediaAoAno.toFixed(2)}% ao ano). Valores de parcela e total abaixo
          usam o valor e o prazo preenchidos acima.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Instituição</th>
                <th className="px-4 py-2 font-medium">% ao mês</th>
                <th className="px-4 py-2 font-medium">% ao ano</th>
                <th className="px-4 py-2 font-medium">Parcela</th>
                <th className="px-4 py-2 font-medium">Total pago</th>
                <th className="px-4 py-2 font-medium">Total juros</th>
              </tr>
            </thead>
            <tbody>
              {taxasExibidas.map((t) => {
                const simulacao =
                  valor > 0 && meses > 0 ? simularPrice(valor, t.taxaAoMes, meses) : null;
                return (
                  <tr key={t.instituicao} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{t.posicao}</td>
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <LogoInstituicao nome={t.instituicao} url={logosPorSlug[slugify(t.instituicao)]} />
                        {t.instituicao}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{t.taxaAoMes.toFixed(2)}%</td>
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{t.taxaAoAno.toFixed(2)}%</td>
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                      {simulacao ? formatarMoeda(simulacao.parcela) : "—"}
                    </td>
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                      {simulacao ? formatarMoeda(simulacao.totalPago) : "—"}
                    </td>
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                      {simulacao ? formatarMoeda(simulacao.totalJuros) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {restantes > 0 && (
          <button
            type="button"
            onClick={() => setMostrarTodos((v) => !v)}
            className="mt-4 rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {mostrarTodos ? "Ver menos" : `Ver todos (mais ${restantes})`}
          </button>
        )}

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
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
    </div>
  );
}

function LogoInstituicao({ nome, url }: { nome: string; url?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="h-6 w-6 shrink-0 object-contain" />;
  }

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: corAvatar(nome) }}
      aria-hidden
    >
      {iniciaisInstituicao(nome)}
    </span>
  );
}
