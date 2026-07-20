"use client";

import { limparTaxas } from "./actions-cartao-anuidade";

export function BotaoLimparTaxasCartaoAnuidade() {
  return (
    <form
      action={async () => {
        const confirmado = window.confirm(
          "Tem certeza? Isso apaga TODOS os cartões cadastrados, sem volta. Use antes de uma nova carga completa."
        );
        if (!confirmado) return;
        await limparTaxas();
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
      >
        Limpar tabela
      </button>
    </form>
  );
}
