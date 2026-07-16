import { list } from "@vercel/blob";
import { blobConfigurado, codigoDoCaminho } from "@/lib/logos";
import { obterSitesPorCnpj8 } from "@/lib/sites";
import { obterTaxasMaquininha } from "@/lib/taxas-maquininha";
import { AdminTabs } from "./AdminTabs";
import { SecaoInstituicoes } from "./SecaoInstituicoes";
import { SecaoMaquininhas } from "./SecaoMaquininhas";
import { SecaoSenha } from "./SecaoSenha";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!blobConfigurado()) {
    return (
      <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Administração</h1>
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          O Blob Store ainda não foi ativado neste projeto na Vercel. Ative em
          Storage → Create Database → Blob e faça um novo deploy antes de
          usar esta página.
        </p>
      </main>
    );
  }

  const [{ blobs }, sites, taxas] = await Promise.all([
    list({ prefix: "logos/" }),
    obterSitesPorCnpj8(),
    obterTaxasMaquininha(),
  ]);

  const logosPorCnpj8 = new Map(blobs.map((b) => [codigoDoCaminho(b.pathname), b.url]));

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Administração</h1>

      <AdminTabs
        instituicoes={<SecaoInstituicoes logosPorCnpj8={logosPorCnpj8} sites={sites} />}
        maquininhas={<SecaoMaquininhas taxas={taxas} />}
        senha={<SecaoSenha />}
      />
    </main>
  );
}
