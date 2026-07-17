"use client";

import { useState } from "react";
import { calcularSaqueAniversario, SAQUE_ANIVERSARIO_FAIXAS } from "@/lib/saque-aniversario";
import { CampoMoeda } from "@/components/CampoMoeda";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarFaixaLabel(ate: number | null, anterior: number): string {
  if (ate === null) return `Acima de ${formatarMoeda(anterior)}`;
  if (anterior === 0) return `Até ${formatarMoeda(ate)}`;
  return `De ${formatarMoeda(anterior)} até ${formatarMoeda(ate)}`;
}

export function SimuladorSaqueAniversario() {
  const [saldo, setSaldo] = useState(5000);
  const resultado = calcularSaqueAniversario(saldo);

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <label className="flex max-w-sm flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Saldo total do FGTS (soma de todas as contas)
          <CampoMoeda
            valor={saldo}
            onChange={setSaldo}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          O cálculo considera a soma dos saldos de todas as suas contas
          vinculadas do FGTS na data de aniversário - não apenas a conta do
          emprego atual.
        </p>

        <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Alíquota aplicada</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{resultado.aliquota}%</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Parcela adicional</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatarMoeda(resultado.parcelaAdicional)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Valor do saque</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {formatarMoeda(resultado.valorSaque)}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Saldo que permanece</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatarMoeda(resultado.saldoRemanescente)}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Tabela oficial de alíquotas
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Definida pela Lei 8.036/1990 (art. 20-B) - o percentual aplicado
          depende da faixa em que o saldo total do seu FGTS se encaixa.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Faixa de saldo</th>
                <th className="px-4 py-2 text-right font-medium">Alíquota</th>
                <th className="px-4 py-2 text-right font-medium">Parcela adicional</th>
              </tr>
            </thead>
            <tbody>
              {SAQUE_ANIVERSARIO_FAIXAS.map((faixa, indice) => {
                const anterior = indice === 0 ? 0 : (SAQUE_ANIVERSARIO_FAIXAS[indice - 1].ate ?? 0);
                const ativa = saldo > 0 && indice === resultado.faixaIndice;
                return (
                  <tr
                    key={faixa.aliquota}
                    className={`border-t border-zinc-100 dark:border-zinc-800 ${
                      ativa ? "bg-emerald-50 dark:bg-emerald-950" : ""
                    }`}
                  >
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                      {formatarFaixaLabel(faixa.ate, anterior)}
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">{faixa.aliquota}%</td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                      {formatarMoeda(faixa.parcelaAdicional)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
