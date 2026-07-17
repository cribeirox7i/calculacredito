"use client";

import { useActionState } from "react";
import { LINKS_PF, LINKS_PJ } from "@/lib/navegacao";
import { salvarVisibilidade } from "./actions-operacoes";
import { MensagemAcao } from "./MensagemAcao";
import type { EstadoAcao } from "./tipos-acao";

type LinkNav = { href: string; label: string };

function GrupoOperacoes({ titulo, links, ocultasSet }: { titulo: string; links: LinkNav[]; ocultasSet: Set<string> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{titulo}</h3>
      <div className="mt-2 space-y-2">
        {links.map((link) => (
          <label
            key={link.href}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm dark:border-zinc-800"
          >
            <input
              type="checkbox"
              name="visivel"
              value={link.href}
              defaultChecked={!ocultasSet.has(link.href)}
              className="h-4 w-4 cursor-pointer rounded border-zinc-300 dark:border-zinc-700"
            />
            <span className="flex-1 text-zinc-900 dark:text-zinc-100">{link.label}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{link.href}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

async function acao(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  try {
    await salvarVisibilidade(formData);
    return { ok: true, mensagem: "Visibilidade dos menus salva com sucesso." };
  } catch (erro) {
    return { ok: false, mensagem: erro instanceof Error ? erro.message : "Erro ao salvar." };
  }
}

export function SecaoOperacoes({ ocultas }: { ocultas: string[] }) {
  const ocultasSet = new Set(ocultas);
  const [estado, formAction, pendente] = useActionState(acao, null);

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Menus de operações</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Desmarque uma operação para ocultá-la do menu superior, do rodapé e da
        tela inicial - útil quando ainda não há taxas cadastradas para aquele
        produto. A página continua acessível por link direto, só some dos
        menus.
      </p>

      <form action={formAction} className="mt-6 space-y-6">
        <GrupoOperacoes titulo="Pessoa física" links={LINKS_PF} ocultasSet={ocultasSet} />
        <GrupoOperacoes titulo="Pessoa jurídica" links={LINKS_PJ} ocultasSet={ocultasSet} />

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
