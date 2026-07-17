"use client";

import { useActionState } from "react";
import { salvarInstituicao } from "./actions-instituicoes";
import { MensagemAcao } from "./MensagemAcao";
import type { EstadoAcao } from "./tipos-acao";

async function acao(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  try {
    await salvarInstituicao(formData);
    return { ok: true, mensagem: "Instituição salva com sucesso." };
  } catch (erro) {
    return { ok: false, mensagem: erro instanceof Error ? erro.message : "Erro ao salvar a instituição." };
  }
}

export function FormSalvarInstituicao() {
  const [estado, formAction, pendente] = useActionState(acao, null);

  return (
    <div>
      <form
        action={formAction}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Código CNPJ8 (Banco Central)
          <input
            type="text"
            name="cnpj8"
            pattern="\d{8}"
            title="8 dígitos numéricos"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Imagem (PNG, fundo transparente de preferência)
          <input type="file" name="arquivo" accept="image/*" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Site oficial (URL)
          <input
            type="text"
            name="site"
            placeholder="www.banco.com.br"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <button
          type="submit"
          disabled={pendente}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pendente ? "Salvando..." : "Salvar"}
        </button>
      </form>
      <MensagemAcao estado={estado} />
    </div>
  );
}
