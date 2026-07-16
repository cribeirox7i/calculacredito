import { list, put } from "@vercel/blob";
import { blobConfigurado } from "@/lib/logos";

const CAMINHO_SITES = "sites.json";

// `revalidate: false` força leitura sempre fresca (usado no read-modify-write
// das Server Actions, que já rodam fora de páginas estáticas). Um número
// alinha com o cache de dados do Next — necessário nas páginas estáticas de
// modalidade, já que um fetch "no-store" ali quebra a geração estática em
// runtime ("Page changed from static to dynamic") e trava a página na
// versão antiga em vez de aceitar a revalidação sob demanda.
async function buscarSitesJson(revalidate: number | false): Promise<Record<string, string>> {
  if (!blobConfigurado()) return {};

  try {
    const { blobs } = await list({ prefix: CAMINHO_SITES });
    const arquivo = blobs.find((b) => b.pathname === CAMINHO_SITES);
    if (!arquivo) return {};

    const res = await fetch(
      arquivo.url,
      revalidate === false ? { cache: "no-store" } : { next: { revalidate } }
    );
    if (!res.ok) return {};
    return (await res.json()) as Record<string, string>;
  } catch {
    return {};
  }
}

// Usado pelas páginas públicas (estáticas) — revalidação alinhada com o
// mesmo período das taxas do BCB; revalidatePath força atualização imediata
// quando o admin salva/exclui um site.
export function obterSitesPorCnpj8(): Promise<Record<string, string>> {
  return buscarSitesJson(60 * 60 * 24);
}

// Usado só dentro das Server Actions de admin (fora de rota estática) pra
// garantir leitura fresca antes de regravar o arquivo.
function obterSitesAtuais(): Promise<Record<string, string>> {
  return buscarSitesJson(false);
}

export async function salvarSite(cnpj8: string, url: string): Promise<void> {
  const sites = await obterSitesAtuais();
  sites[cnpj8] = url;
  await put(CAMINHO_SITES, JSON.stringify(sites), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function removerSite(cnpj8: string): Promise<void> {
  const sites = await obterSitesAtuais();
  delete sites[cnpj8];
  await put(CAMINHO_SITES, JSON.stringify(sites), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}
