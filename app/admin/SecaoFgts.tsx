import type { TaxaFgts } from "@/lib/taxas-fgts";
import { adicionarTaxa, importarArquivo } from "./actions-fgts";
import { BotaoLimparTaxasFgts } from "./BotaoLimparTaxasFgts";
import { ImportadorArquivo } from "./ImportadorArquivo";
import { LinhaTaxaFgts } from "./LinhaTaxaFgts";

export function SecaoFgts({ taxas }: { taxas: TaxaFgts[] }) {
  const instituicoes = [...new Set(taxas.map((t) => t.instituicao))].sort();

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Taxas de antecipação do FGTS
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Cadastre a taxa mensal de deságio que cada instituição cobra para
        antecipar o saque-aniversário, manualmente ou em lote via CSV ou
        Excel. Reimportar um arquivo substitui todas as linhas da(s)
        instituição(ões) presentes nele - instituições ausentes não são
        afetadas.
      </p>

      <div className="mt-6">
        <ImportadorArquivo
          titulo="Importar taxas em lote"
          action={importarArquivo}
          exportarCsvHref="/admin/exportar-fgts"
          exportarXlsxHref="/admin/exportar-fgts-xlsx"
        />
      </div>

      <form
        action={adicionarTaxa}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
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
          Plano
          <input
            type="text"
            name="plano"
            required
            placeholder="Padrão"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Taxa mensal (%)
          <input
            type="text"
            name="taxaMensal"
            required
            placeholder="1,79"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Prazo máx. (anos)
          <input
            type="number"
            name="prazoMaximoAnos"
            min={1}
            max={10}
            required
            placeholder="10"
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
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
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Adicionar linha
        </button>
      </form>

      {instituicoes.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Taxas cadastradas</h3>
          <BotaoLimparTaxasFgts />
        </div>
      )}

      {instituicoes.map((instituicao) => {
        const linhas = taxas.filter((t) => t.instituicao === instituicao).sort((a, b) => a.plano.localeCompare(b.plano));

        return (
          <div key={instituicao} className="mt-8">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{instituicao}</h3>
            <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Plano</th>
                    <th className="px-4 py-2 font-medium">Taxa mensal</th>
                    <th className="px-4 py-2 font-medium">Prazo máximo</th>
                    <th className="px-4 py-2 font-medium">Atualizado em</th>
                    <th className="px-4 py-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((t) => (
                    <LinhaTaxaFgts key={t.id} taxa={t} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {instituicoes.length === 0 && (
        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Nenhuma taxa cadastrada ainda.
        </p>
      )}
    </div>
  );
}
