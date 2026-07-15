import { list } from "@vercel/blob";
import { blobConfigurado, codigoDoCaminho } from "@/lib/logos";
import { enviarLogo, excluirLogo } from "./actions";

export default async function AdminLogosPage() {
  if (!blobConfigurado()) {
    return (
      <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Logos das instituições
        </h1>
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          O Blob Store ainda não foi ativado neste projeto na Vercel. Ative em
          Storage → Create Database → Blob e faça um novo deploy antes de
          usar esta página.
        </p>
      </main>
    );
  }

  const { blobs } = await list({ prefix: "logos/" });

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Logos das instituições
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Informe o código CNPJ8 (Banco Central) da instituição — ele aparece
        em texto pequeno abaixo do nome de cada instituição nas tabelas do
        site. É a chave usada para casar o logo com a instituição certa, já
        que nomes têm variações entre modalidades.
      </p>

      <form
        action={enviarLogo}
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
          <input type="file" name="arquivo" accept="image/*" required />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Enviar
        </button>
      </form>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {blobs.map((blob) => (
          <div
            key={blob.pathname}
            className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={blob.url} alt={codigoDoCaminho(blob.pathname)} className="h-12 w-12 object-contain" />
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              {codigoDoCaminho(blob.pathname)}
            </p>
            <form action={excluirLogo.bind(null, blob.url)}>
              <button
                type="submit"
                className="text-xs text-red-600 underline dark:text-red-400"
              >
                Excluir
              </button>
            </form>
          </div>
        ))}
        {blobs.length === 0 && (
          <p className="col-span-full text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum logo enviado ainda.
          </p>
        )}
      </div>
    </main>
  );
}
