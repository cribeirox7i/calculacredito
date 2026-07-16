import { list } from "@vercel/blob";
import { blobConfigurado, codigoDoCaminho } from "@/lib/logos";
import { obterSitesPorCnpj8 } from "@/lib/sites";
import { excluirLogo, excluirSite, salvarInstituicao } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLogosPage() {
  if (!blobConfigurado()) {
    return (
      <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Instituições - logos e sites
        </h1>
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          O Blob Store ainda não foi ativado neste projeto na Vercel. Ative em
          Storage → Create Database → Blob e faça um novo deploy antes de
          usar esta página.
        </p>
      </main>
    );
  }

  const [{ blobs }, sites] = await Promise.all([list({ prefix: "logos/" }), obterSitesPorCnpj8()]);

  const logosPorCnpj8 = new Map(blobs.map((b) => [codigoDoCaminho(b.pathname), b.url]));
  const cnpj8s = [...new Set([...logosPorCnpj8.keys(), ...Object.keys(sites)])].sort();

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Instituições - logos e sites
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Informe o código CNPJ8 (Banco Central) da instituição - ele aparece
        em texto pequeno abaixo do nome de cada instituição nas tabelas do
        site. É a chave usada pra casar o logo e o link do site com a
        instituição certa, já que nomes têm variações entre modalidades.
        Preencha o logo e/ou o site - não precisa dos dois de uma vez.
      </p>

      <form
        action={salvarInstituicao}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
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
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Salvar
        </button>
      </form>

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
    </main>
  );
}
