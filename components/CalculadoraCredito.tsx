"use client";

import { useMemo, useState } from "react";
import { simularPrice } from "@/lib/amortizacao";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CalculadoraCredito({
  taxaMediaAoMes,
  valorInicial = 5000,
  mesesInicial = 24,
}: {
  taxaMediaAoMes: number;
  valorInicial?: number;
  mesesInicial?: number;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [meses, setMeses] = useState(mesesInicial);
  const [taxa, setTaxa] = useState(Number(taxaMediaAoMes.toFixed(2)));

  const resultado = useMemo(() => {
    if (valor <= 0 || meses <= 0 || taxa <= 0) return null;
    return simularPrice(valor, taxa, meses);
  }, [valor, meses, taxa]);

  return (
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
  );
}
