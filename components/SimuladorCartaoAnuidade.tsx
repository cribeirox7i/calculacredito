"use client";

import { useMemo, useState } from "react";
import type { TaxaCartaoAnuidade } from "@/lib/taxas-cartao-anuidade";
import { corAvatar, iniciaisInstituicao, removerAcentos } from "@/lib/logos";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function SimuladorCartaoAnuidade({ taxas }: { taxas: TaxaCartaoAnuidade[] }) {
  const [busca, setBusca] = useState("");

  const buscaNormalizada = removerAcentos(busca.trim().toLowerCase());

  const linhas = useMemo(() => {
    const filtradas = buscaNormalizada
      ? taxas.filter(
          (t) =>
            removerAcentos(t.instituicao.toLowerCase()).includes(buscaNormalizada) ||
            removerAcentos(t.cartao.toLowerCase()).includes(buscaNormalizada)
        )
      : taxas;

    return [...filtradas].sort((a, b) => a.valorAnuidade - b.valorAnuidade);
  }, [taxas, buscaNormalizada]);

  const gratuitos = linhas.filter((l) => l.valorAnuidade === 0).length;

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cartões cadastrados</p>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{linhas.length}</p>
        {gratuitos > 0 && (
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
            {gratuitos} com anuidade grátis
          </p>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Comparativo por instituição
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Ordenado pela menor anuidade.
        </p>

        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar instituição ou cartão..."
          className="mt-4 w-full max-w-sm rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />

        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Instituição</th>
                <th className="px-4 py-2 font-medium">Cartão</th>
                <th className="px-4 py-2 text-right font-medium">Anuidade</th>
                <th className="px-4 py-2 font-medium">Benefícios</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.id} className="border-t border-zinc-100 dark:border-zinc-800">
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
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{l.cartao}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    {l.valorAnuidade === 0 ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Grátis
                      </span>
                    ) : (
                      `${formatarMoeda(l.valorAnuidade)}/ano`
                    )}
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{l.beneficios || "-"}</td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Nenhum cartão cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Valores anunciados publicamente pelas próprias instituições,
          cadastrados manualmente neste site - não são uma média oficial de
          mercado. Passe o mouse ou toque no nome da instituição para ver a
          fonte de cada valor.
        </p>
      </section>
    </div>
  );
}
