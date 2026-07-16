import type { ModalidadeTaxa, TaxaMaquininha } from "@/lib/taxas-maquininha";
import { adicionarTaxa, importarCsv, removerTaxa } from "./actions-maquininhas";

const ROTULO_MODALIDADE: Record<ModalidadeTaxa, string> = {
  pix: "Pix",
  debito: "Débito",
  credito_vista: "Crédito à vista",
  credito_parcelado: "Crédito parcelado",
};

export function SecaoMaquininhas({ taxas }: { taxas: TaxaMaquininha[] }) {
  const adquirentes = [...new Set(taxas.map((t) => t.adquirente))].sort();

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Taxas de maquininha
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Cadastre as taxas por adquirente manualmente ou em lote via CSV. Cada
        linha representa uma combinação de adquirente + plano + modalidade
        (Pix, débito, crédito à vista ou crédito parcelado com número de
        parcelas). Reimportar um CSV substitui todas as linhas do(s)
        adquirente(s) presentes no arquivo - adquirentes ausentes do CSV não
        são afetados.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <a
          href="/admin/exportar-maquininhas"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Baixar modelo CSV
        </a>
        <form action={importarCsv} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="arquivo"
            accept=".csv,text/csv"
            required
            className="text-sm text-zinc-700 dark:text-zinc-300"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Importar CSV
          </button>
        </form>
      </div>

      <form
        action={adicionarTaxa}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
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
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Adicionar linha
        </button>
      </form>

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
                    <tr key={t.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{t.plano}</td>
                      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                        {ROTULO_MODALIDADE[t.modalidade]}
                      </td>
                      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{t.parcelas ?? "-"}</td>
                      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                        {t.taxa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}%
                      </td>
                      <td className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(t.atualizadoEm).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-2">
                        <form action={removerTaxa.bind(null, t.id)}>
                          <button type="submit" className="text-xs text-red-600 underline dark:text-red-400">
                            Excluir
                          </button>
                        </form>
                      </td>
                    </tr>
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
