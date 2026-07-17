"use client";

import { useActionState } from "react";
import { trocarSenha } from "./actions-senha";
import { MensagemAcao } from "./MensagemAcao";
import type { EstadoAcao } from "./tipos-acao";

async function acao(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  try {
    await trocarSenha(formData);
    return { ok: true, mensagem: "Senha alterada com sucesso." };
  } catch (erro) {
    return { ok: false, mensagem: erro instanceof Error ? erro.message : "Erro ao trocar a senha." };
  }
}

export function FormTrocarSenha() {
  const [estado, formAction, pendente] = useActionState(acao, null);

  return (
    <div className="max-w-sm">
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Senha atual
          <input
            type="password"
            name="senhaAtual"
            required
            autoComplete="current-password"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nova senha
          <input
            type="password"
            name="novaSenha"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Confirmar nova senha
          <input
            type="password"
            name="confirmacaoSenha"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <button
          type="submit"
          disabled={pendente}
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pendente ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
      <MensagemAcao estado={estado} />
    </div>
  );
}
