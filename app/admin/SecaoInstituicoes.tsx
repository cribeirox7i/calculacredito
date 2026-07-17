import { excluirLogo, excluirSite, importarArquivoSites } from "./actions-instituicoes";
import { FormSalvarInstituicao } from "./FormSalvarInstituicao";
import { ImportadorArquivo } from "./ImportadorArquivo";

export function SecaoInstituicoes({
  logosPorCnpj8,
  sites,
}: {
  logosPorCnpj8: Map<string, string>;
  sites: Record<string, string>;
}) {
  const cnpj8s = [...new Set([...logosPorCnpj8.keys(), ...Object.keys(sites)])].sort();

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Instituições - logos e sites
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Informe o código CNPJ8 (Banco Central) da instituição - ele aparece
        em texto pequeno abaixo do nome de cada instituição nas tabelas do
        site. É a chave usada pra casar o logo e o link do site com a
        instituição certa, já que nomes têm variações entre modalidades.
        Preencha o logo e/ou o site - não precisa dos dois de uma vez.
      </p>

      <div className="mt-6">
        <ImportadorArquivo
          titulo="Importar sites em lote"
          action={importarArquivoSites}
          exportarCsvHref="/admin/exportar-sites"
          exportarXlsxHref="/admin/exportar-sites-xlsx"
        />
      </div>

      <div className="mt-6">
        <FormSalvarInstituicao />
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-medium">Logo</th>
              <th className="px-4 py-2 font-medium">CNPJ8</th>
              <th className="px-4 py-2 font-medium">Site</th>
              <th className="px-4 py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cnpj8s.map((cnpj8) => {
              const urlLogo = logosPorCnpj8.get(cnpj8);
              const urlSite = sites[cnpj8];
              return (
                <tr key={cnpj8} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-2">
                    {urlLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={urlLogo} alt={cnpj8} className="h-8 w-8 object-contain" />
                    ) : (
                      <span className="text-xs text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{cnpj8}</td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
                    {urlSite ? (
                      <a href={urlSite} target="_blank" rel="noopener noreferrer" className="underline">
                        {urlSite}
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      {urlLogo && (
                        <form action={excluirLogo.bind(null, urlLogo)}>
                          <button type="submit" className="text-xs text-red-600 underline dark:text-red-400">
                            Excluir logo
                          </button>
                        </form>
                      )}
                      {urlSite && (
                        <form action={excluirSite.bind(null, cnpj8)}>
                          <button type="submit" className="text-xs text-red-600 underline dark:text-red-400">
                            Excluir site
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {cnpj8s.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Nenhuma instituição cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
