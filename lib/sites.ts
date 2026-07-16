import { list, put } from "@vercel/blob";
import { blobConfigurado } from "@/lib/logos";

const CAMINHO_SITES = "sites.json";

// Guarda {cnpj8: url} num único arquivo JSON no Blob — não precisa de banco
// de dados tradicional pra um mapeamento tão simples (mesmo princípio dos logos).
export async function obterSitesPorCnpj8(): Promise<Record<string, string>> {
  if (!blobConfigurado()) return {};

  try {
    const { blobs } = await list({ prefix: CAMINHO_SITES });
    const arquivo = blobs.find((b) => b.pathname === CAMINHO_SITES);
    if (!arquivo) return {};

    const res = await fetch(arquivo.url, { cache: "no-store" });
    if (!res.ok) return {};
    return (await res.json()) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function salvarSite(cnpj8: string, url: string): Promise<void> {
  const sites = await obterSitesPorCnpj8();
  sites[cnpj8] = url;
  await put(CAMINHO_SITES, JSON.stringify(sites), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function removerSite(cnpj8: string): Promise<void> {
  const sites = await obterSitesPorCnpj8();
  delete sites[cnpj8];
  await put(CAMINHO_SITES, JSON.stringify(sites), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}
