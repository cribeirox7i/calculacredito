import { list, put } from "@vercel/blob";
import { blobConfigurado } from "@/lib/logos";

const CAMINHO_OCULTAS = "operacoes-ocultas.json";

// Guarda só os hrefs (de lib/navegacao.ts) que o admin marcou como ocultos -
// mesma ideia de lib/taxas-maquininha.ts, mas o "dado" aqui é só a lista de
// chaves escondidas, não registros completos.
async function buscarOcultasJson(revalidate: number | false): Promise<string[]> {
  if (!blobConfigurado()) return [];

  try {
    const { blobs } = await list({ prefix: CAMINHO_OCULTAS });
    const arquivo = blobs.find((b) => b.pathname === CAMINHO_OCULTAS);
    if (!arquivo) return [];

    const res = await fetch(
      arquivo.url,
      revalidate === false ? { cache: "no-store" } : { next: { revalidate } }
    );
    if (!res.ok) return [];
    return (await res.json()) as string[];
  } catch {
    return [];
  }
}

// Usado pelo layout/home (públicos) - mesmo período de revalidação das
// outras taxas do site.
export function obterOperacoesOcultas(): Promise<string[]> {
  return buscarOcultasJson(60 * 60 * 24);
}

// Usado só na página de admin, pra sempre mostrar o estado mais recente.
export function obterOperacoesOcultasAtual(): Promise<string[]> {
  return buscarOcultasJson(false);
}

export async function salvarOperacoesOcultas(ocultas: string[]): Promise<void> {
  await put(CAMINHO_OCULTAS, JSON.stringify(ocultas), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}
