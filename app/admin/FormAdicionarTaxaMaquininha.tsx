"use client";

import { useActionState } from "react";
import type { ModalidadeTaxa } from "@/lib/taxas-maquininha";
import { adicionarTaxa } from "./actions-maquininhas";
import { MensagemAcao } from "./MensagemAcao";
import type { EstadoAcao } from "./tipos-acao";

const ROTULO_MODALIDADE: Record<ModalidadeTaxa, string> = {
  pix: "Pix",
  debito: "Débito",
  credito_vista: "Crédito à vista",
  credito_parcelado: "Crédito parcelado",
};

async function acao(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  try {
    await adicionarTaxa(formData);
    return { ok: true, mensagem: "Taxa adicionada com sucesso." };
  } catch (erro) {
    return { ok: false, mensagem: erro instanceof Error ? erro.message : "Erro ao adicionar a taxa." };
  }
}

export function FormAdicionarTaxaMaquininha() {
  const [estado, formAction, pendente] = useActionState(acao, null);

  return (
    <div>
      <form
        action={formAction}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Adquirente
          <input
            type="text"
            name="adquirente"
            required
            placeholder="Cielo"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Plano
          <input
            type="text"
            name="plano"
            required
            placeholder="Smart - Sem aluguel"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Modalidade
          <select
            name="modalidade"
            required
            defaultValue=""
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="" disabled>
              Selecione
            </option>
            {Object.entries(ROTULO_MODALIDADE).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Parcelas
          <input
            type="number"
            name="parcelas"
            min={2}
            max={24}
            placeholder="só p/ parcelado"
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Taxa (%)
          <input
            type="text"
            name="taxa"
            required
            placeholder="3,15"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
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
