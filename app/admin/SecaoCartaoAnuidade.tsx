import type { TaxaCartaoAnuidade } from "@/lib/taxas-cartao-anuidade";
import { importarArquivo } from "./actions-cartao-anuidade";
import { BotaoLimparTaxasCartaoAnuidade } from "./BotaoLimparTaxasCartaoAnuidade";
import { FormAdicionarTaxaCartaoAnuidade } from "./FormAdicionarTaxaCartaoAnuidade";
import { ImportadorArquivo } from "./ImportadorArquivo";
import { LinhaTaxaCartaoAnuidade } from "./LinhaTaxaCartaoAnuidade";

export function SecaoCartaoAnuidade({ taxas }: { taxas: TaxaCartaoAnuidade[] }) {
  const instituicoes = [...new Set(taxas.map((t) => t.instituicao))].sort();

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Anuidade e benefícios de cartão de crédito
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Cadastre o valor de anuidade e os principais benefícios de cada cartão,
        manualmente ou em lote via CSV ou Excel. Reimportar um arquivo
        substitui todas as linhas da(s) instituição(ões) presentes nele -
        instituições ausentes não são afetadas.
      </p>

      <div className="mt-6">
        <ImportadorArquivo
          titulo="Importar cartões em lote"
          action={importarArquivo}
          exportarCsvHref="/admin/exportar-cartao-anuidade"
          exportarXlsxHref="/admin/exportar-cartao-anuidade-xlsx"
        />
      </div>

      <div className="mt-6">
        <FormAdicionarTaxaCartaoAnuidade />
      </div>

      {instituicoes.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Cartões cadastrados</h3>
          <BotaoLimparTaxasCartaoAnuidade />
        </div>
      )}

      {instituicoes.map((instituicao) => {
        const linhas = taxas.filter((t) => t.instituicao === instituicao).sort((a, b) => a.cartao.localeCompare(b.cartao));

        return (
          <div key={instituicao} className="mt-8">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{instituicao}</h3>
            <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Cartão</th>
                    <th className="px-4 py-2 font-medium">Anuidade</th>
                    <th className="px-4 py-2 font-medium">Benefícios</th>
                    <th className="px-4 py-2 font-medium">Atualizado em</th>
                    <th className="px-4 py-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((t) => (
                    <LinhaTaxaCartaoAnuidade key={t.id} taxa={t} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {instituicoes.length === 0 && (
        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum cartão cadastrado ainda.
        </p>
      )}
    </div>
  );
}
