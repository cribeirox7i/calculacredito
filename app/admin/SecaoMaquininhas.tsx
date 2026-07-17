import type { TaxaMaquininha } from "@/lib/taxas-maquininha";
import { importarArquivo } from "./actions-maquininhas";
import { BotaoLimparTaxas } from "./BotaoLimparTaxas";
import { FormAdicionarTaxaMaquininha } from "./FormAdicionarTaxaMaquininha";
import { ImportadorArquivo } from "./ImportadorArquivo";
import { LinhaTaxaMaquininha } from "./LinhaTaxaMaquininha";

export function SecaoMaquininhas({ taxas }: { taxas: TaxaMaquininha[] }) {
  const adquirentes = [...new Set(taxas.map((t) => t.adquirente))].sort();

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Taxas de maquininha
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Cadastre as taxas por adquirente manualmente ou em lote via CSV ou
        Excel. Cada linha representa uma combinação de adquirente + plano +
        modalidade (Pix, débito, crédito à vista ou crédito parcelado com
        número de parcelas). Reimportar um arquivo substitui todas as linhas
        do(s) adquirente(s) presentes nele - adquirentes ausentes não são
        afetados.
      </p>

      <div className="mt-6">
        <ImportadorArquivo
          titulo="Importar taxas em lote"
          action={importarArquivo}
          exportarCsvHref="/admin/exportar-maquininhas"
          exportarXlsxHref="/admin/exportar-maquininhas-xlsx"
        />
      </div>

      <div className="mt-6">
        <FormAdicionarTaxaMaquininha />
      </div>

      {adquirentes.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Taxas cadastradas</h3>
          <BotaoLimparTaxas />
        </div>
      )}

      {adquirentes.map((adquirente) => {
        const linhas = taxas
          .filter((t) => t.adquirente === adquirente)
          .sort((a, b) => a.plano.localeCompare(b.plano) || a.modalidade.localeCompare(b.modalidade));

        return (
          <div key={adquirente} className="mt-8">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{adquirente}</h3>
            <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Plano</th>
                    <th className="px-4 py-2 font-medium">Modalidade</th>
                    <th className="px-4 py-2 font-medium">Parcelas</th>
                    <th className="px-4 py-2 font-medium">Taxa</th>
                    <th className="px-4 py-2 font-medium">Atualizado em</th>
                    <th className="px-4 py-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((t) => (
                    <LinhaTaxaMaquininha key={t.id} taxa={t} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {adquirentes.length === 0 && (
        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Nenhuma taxa cadastrada ainda.
        </p>
      )}
    </div>
  );
}
