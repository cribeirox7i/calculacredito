"use client";

import { useMemo, useState } from "react";
import type { TaxaFgts } from "@/lib/taxas-fgts";
import { calcularSaqueAniversario } from "@/lib/saque-aniversario";
import { calcularValorPresenteFgts } from "@/lib/fgts-antecipacao";
import { corAvatar, iniciaisInstituicao, removerAcentos } from "@/lib/logos";
import { CampoMoeda } from "@/components/CampoMoeda";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type LinhaComparativo = TaxaFgts & { valorLiquido: number };

export function SimuladorFgtsAntecipacao({ taxas }: { taxas: TaxaFgts[] }) {
  const [saldo, setSaldo] = useState(5000);
  const [anos, setAnos] = useState(5);
  const [busca, setBusca] = useState("");

  const parcelaAnual = calcularSaqueAniversario(saldo).valorSaque;
  const somaSemAntecipar = parcelaAnual * anos;
  const buscaNormalizada = removerAcentos(busca.trim().toLowerCase());

  const linhas = useMemo<LinhaComparativo[]>(() => {
    const elegiveis = taxas.filter((t) => t.prazoMaximoAnos >= anos);
    const comCalculo: LinhaComparativo[] = elegiveis.map((t) => ({
      ...t,
      valorLiquido: calcularValorPresenteFgts(parcelaAnual, anos, t.taxaMensal),
    }));

    const filtradas = buscaNormalizada
      ? comCalculo.filter((l) => removerAcentos(l.instituicao.toLowerCase()).includes(buscaNormalizada))
      : comCalculo;

    return [...filtradas].sort((a, b) => b.valorLiquido - a.valorLiquido);
  }, [taxas, anos, parcelaAnual, buscaNormalizada]);

  const melhor = linhas[0];

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Saldo total do FGTS
            <CampoMoeda
              valor={saldo}
              onChange={setSaldo}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Parcelas a antecipar (anos)
            <select
              value={anos}
              onChange={(e) => setAnos(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "ano" : "anos"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Estimamos a parcela anual do saque-aniversário pela tabela oficial de
          alíquotas, aplicada ao saldo atual - e assumimos essa mesma parcela
          se repetindo nos próximos anos, sem projetar o crescimento do saldo
          por novos depósitos e correção. É uma simplificação: converse com o
          banco para o valor exato que ele projeta.
        </p>

        <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-2 dark:border-zinc-800">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Parcela anual estimada</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{formatarMoeda(parcelaAnual)}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Soma das parcelas em {anos} {anos === 1 ? "ano" : "anos"} (sem antecipar)
            </p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatarMoeda(somaSemAntecipar)}
            </p>
          </div>
        </div>

        {melhor && (
          <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-3 dark:border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Melhor oferta</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {melhor.instituicao} - {melhor.plano}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Você recebe hoje</p>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {formatarMoeda(melhor.valorLiquido)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Custo da antecipação</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(somaSemAntecipar - melhor.valorLiquido)}
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
          Mostrando instituições que antecipam até <strong>{anos}</strong>{" "}
          {anos === 1 ? "ano" : "anos"} de parcelas, ordenadas pelo maior valor
          líquido recebido hoje.
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
                <th className="px-4 py-2 text-right font-medium">Você recebe (R$)</th>
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
                    {l.prazoMaximoAnos} anos
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    {formatarMoeda(l.valorLiquido)}
                  </td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Nenhuma instituição cadastrada aceita antecipar {anos}{" "}
                    {anos === 1 ? "ano" : "anos"} de parcelas ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Taxas anunciadas publicamente pelas próprias instituições, cadastradas
          manualmente neste site - não são uma média oficial de mercado. A taxa
          real da sua proposta depende da sua análise de crédito. Passe o mouse
          ou toque no nome da instituição para ver a fonte de cada taxa.
        </p>
      </section>
    </div>
  );
}
