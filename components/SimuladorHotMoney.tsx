"use client";

import { useMemo, useState } from "react";
import type { TaxaHotMoney } from "@/lib/taxas-hotmoney";
import { calcularHotMoney } from "@/lib/hotmoney";
import { corAvatar, iniciaisInstituicao, removerAcentos } from "@/lib/logos";
import { CampoMoeda } from "@/components/CampoMoeda";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type LinhaComparativo = TaxaHotMoney & { juros: number; totalPagar: number };

export function SimuladorHotMoney({ taxas }: { taxas: TaxaHotMoney[] }) {
  const [valor, setValor] = useState(50000);
  const [dias, setDias] = useState(15);
  const [busca, setBusca] = useState("");

  const buscaNormalizada = removerAcentos(busca.trim().toLowerCase());

  const linhas = useMemo<LinhaComparativo[]>(() => {
    const elegiveis = taxas.filter((t) => t.prazoMaximoDias >= dias);
    const comCalculo: LinhaComparativo[] = elegiveis.map((t) => {
      const resultado = calcularHotMoney(valor, dias, t.taxaMensal);
      return { ...t, juros: resultado.juros, totalPagar: resultado.totalPagar };
    });

    const filtradas = buscaNormalizada
      ? comCalculo.filter((l) => removerAcentos(l.instituicao.toLowerCase()).includes(buscaNormalizada))
      : comCalculo;

    return [...filtradas].sort((a, b) => a.totalPagar - b.totalPagar);
  }, [taxas, valor, dias, buscaNormalizada]);

  const melhor = linhas[0];

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Valor a tomar emprestado
            <CampoMoeda
              valor={valor}
              onChange={setValor}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Prazo (dias)
            <input
              type="number"
              min={1}
              max={90}
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Hot money é pago de uma vez só no vencimento, sem parcelas - o
          cálculo usa juros simples proporcionais aos dias corridos do
          empréstimo.
        </p>

        {melhor && (
          <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-3 dark:border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Melhor oferta</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {melhor.instituicao} - {melhor.plano}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Juros no período</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(melhor.juros)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total a pagar no vencimento</p>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {formatarMoeda(melhor.totalPagar)}
              </p>
            </div>
          </div>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Comparativo por instituição
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Mostrando instituições que aceitam prazo de <strong>{dias} dias</strong>,
          ordenadas pelo menor total a pagar.
        </p>

        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar instituição..."
          className="mt-4 w-full max-w-sm rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />

        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Instituição</th>
                <th className="px-4 py-2 font-medium">Plano</th>
                <th className="px-4 py-2 text-right font-medium">Taxa mensal</th>
                <th className="px-4 py-2 text-right font-medium">Prazo máximo</th>
                <th className="px-4 py-2 text-right font-medium">Total a pagar (R$)</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, indice) => (
                <tr key={l.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-500 dark:text-zinc-400">
                    {indice + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: corAvatar(l.instituicao) }}
                        aria-hidden
                      >
                        {iniciaisInstituicao(l.instituicao)}
                      </span>
                      {l.fonteUrl ? (
                        <a
                          href={l.fonteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Fonte: ${l.fonteUrl}`}
                          className="hover:underline"
                        >
                          {l.instituicao}
                        </a>
                      ) : (
                        l.instituicao
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{l.plano}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {l.taxaMensal.toFixed(2)}%
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {l.prazoMaximoDias} dias
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    {formatarMoeda(l.totalPagar)}
                  </td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Nenhuma instituição cadastrada aceita esse prazo ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Taxas anunciadas publicamente pelas próprias instituições, cadastradas
          manualmente neste site - não são uma média oficial de mercado. Passe
          o mouse ou toque no nome da instituição para ver a fonte de cada
          taxa.
        </p>
      </section>
    </div>
  );
}
