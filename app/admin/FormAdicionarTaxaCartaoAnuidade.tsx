"use client";

import { useActionState } from "react";
import { adicionarTaxa } from "./actions-cartao-anuidade";
import { MensagemAcao } from "./MensagemAcao";
import type { EstadoAcao } from "./tipos-acao";

async function acao(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  try {
    await adicionarTaxa(formData);
    return { ok: true, mensagem: "Cartão adicionado com sucesso." };
  } catch (erro) {
    return { ok: false, mensagem: erro instanceof Error ? erro.message : "Erro ao adicionar o cartão." };
  }
}

export function FormAdicionarTaxaCartaoAnuidade() {
  const [estado, formAction, pendente] = useActionState(acao, null);

  return (
    <div>
      <form
        action={formAction}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Instituição
          <input
            type="text"
            name="instituicao"
            required
            placeholder="Banco XYZ"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cartão
          <input
            type="text"
            name="cartao"
            required
            placeholder="Platinum"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Anuidade (R$/ano)
          <input
            type="text"
            name="valorAnuidade"
            required
            placeholder="0"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Benefícios
          <input
            type="text"
            name="beneficios"
            placeholder="Milhas, seguro viagem, sala VIP"
            className="w-64 rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Fonte (URL, opcional)
          <input
            type="text"
            name="fonteUrl"
            placeholder="https://..."
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <button
          type="submit"
          disabled={pendente}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pendente ? "Adicionando..." : "Adicionar linha"}
        </button>
      </form>
      <MensagemAcao estado={estado} />
    </div>
  );
}
