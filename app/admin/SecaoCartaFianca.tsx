import type { TaxaCartaFianca } from "@/lib/taxas-carta-fianca";
import { importarArquivo } from "./actions-carta-fianca";
import { BotaoLimparTaxasCartaFianca } from "./BotaoLimparTaxasCartaFianca";
import { FormAdicionarTaxaCartaFianca } from "./FormAdicionarTaxaCartaFianca";
import { ImportadorArquivo } from "./ImportadorArquivo";
import { LinhaTaxaCartaFianca } from "./LinhaTaxaCartaFianca";

export function SecaoCartaFianca({ taxas }: { taxas: TaxaCartaFianca[] }) {
  const instituicoes = [...new Set(taxas.map((t) => t.instituicao))].sort();

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Taxas de carta fiança
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Cadastre a taxa anual cobrada por cada instituição para emitir a
        garantia, manualmente ou em lote via CSV ou Excel. Reimportar um
        arquivo substitui todas as linhas da(s) instituição(ões) presentes
        nele - instituições ausentes não são afetadas.
      </p>

      <div className="mt-6">
        <ImportadorArquivo
          titulo="Importar taxas em lote"
          action={importarArquivo}
          exportarCsvHref="/admin/exportar-carta-fianca"
          exportarXlsxHref="/admin/exportar-carta-fianca-xlsx"
        />
      </div>

      <div className="mt-6">
        <FormAdicionarTaxaCartaFianca />
      </div>

      {instituicoes.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Taxas cadastradas</h3>
          <BotaoLimparTaxasCartaFianca />
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
                    <th className="px-4 py-2 font-medium">Taxa anual</th>
                    <th className="px-4 py-2 font-medium">Prazo máximo</th>
                    <th className="px-4 py-2 font-medium">Atualizado em</th>
                    <th className="px-4 py-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((t) => (
                    <LinhaTaxaCartaFianca key={t.id} taxa={t} />
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
