import { LINKS_PF, LINKS_PJ } from "@/lib/navegacao";
import { salvarVisibilidade } from "./actions-operacoes";

type LinkNav = { href: string; label: string };

function GrupoOperacoes({ titulo, links, ocultasSet }: { titulo: string; links: LinkNav[]; ocultasSet: Set<string> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{titulo}</h3>
      <div className="mt-2 space-y-2">
        {links.map((link) => (
          <label
            key={link.href}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm dark:border-zinc-800"
          >
            <input
              type="checkbox"
              name="visivel"
              value={link.href}
              defaultChecked={!ocultasSet.has(link.href)}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
            />
            <span className="flex-1 text-zinc-900 dark:text-zinc-100">{link.label}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{link.href}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function SecaoOperacoes({ ocultas }: { ocultas: string[] }) {
  const ocultasSet = new Set(ocultas);

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Menus de operações</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Desmarque uma operação para ocultá-la do menu superior, do rodapé e da
        tela inicial - útil quando ainda não há taxas cadastradas para aquele
        produto. A página continua acessível por link direto, só some dos
        menus.
      </p>

      <form action={salvarVisibilidade} className="mt-6 space-y-6">
        <GrupoOperacoes titulo="Pessoa física" links={LINKS_PF} ocultasSet={ocultasSet} />
        <GrupoOperacoes titulo="Pessoa jurídica" links={LINKS_PJ} ocultasSet={ocultasSet} />

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
