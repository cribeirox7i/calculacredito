import { gravarObjeto, lerObjetoTexto, r2Configurado } from "@/lib/r2";

const CAMINHO_SITES = "sites.json";

async function buscarSitesJson(): Promise<Record<string, string>> {
  if (!r2Configurado()) return {};

  const texto = await lerObjetoTexto(CAMINHO_SITES);
  if (!texto) return {};
  try {
    return JSON.parse(texto) as Record<string, string>;
  } catch {
    return {};
  }
}

// Leitura sempre fresca - o R2 não passa pelo Data Cache do Next (não é
// `fetch()`), então não existe o gotcha de cache que o Blob tinha aqui.
export function obterSitesPorCnpj8(): Promise<Record<string, string>> {
  return buscarSitesJson();
}

async function gravar(sites: Record<string, string>): Promise<void> {
  await gravarObjeto(CAMINHO_SITES, JSON.stringify(sites), "application/json");
}

export async function salvarSite(cnpj8: string, url: string): Promise<void> {
  const sites = await buscarSitesJson();
  sites[cnpj8] = url;
  await gravar(sites);
}

export async function removerSite(cnpj8: string): Promise<void> {
  const sites = await buscarSitesJson();
  delete sites[cnpj8];
  await gravar(sites);
}
