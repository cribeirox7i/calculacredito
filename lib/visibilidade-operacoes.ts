import { gravarObjeto, lerObjetoTexto } from "@/lib/r2";

const CAMINHO_OCULTAS = "operacoes-ocultas.json";

// Guarda só os hrefs (de lib/navegacao.ts) que o admin marcou como ocultos.
async function buscarOcultasJson(): Promise<string[]> {
  const texto = await lerObjetoTexto(CAMINHO_OCULTAS);
  if (!texto) return [];
  try {
    return JSON.parse(texto) as string[];
  } catch {
    return [];
  }
}

// Leitura sempre fresca - o R2 não passa pelo Data Cache do Next, então não
// existe mais distinção entre "leitura pública com cache" e "leitura fresca
// do admin" como no Blob (ver lib/sites.ts).
export function obterOperacoesOcultas(): Promise<string[]> {
  return buscarOcultasJson();
}

export function obterOperacoesOcultasAtual(): Promise<string[]> {
  return buscarOcultasJson();
}

export async function salvarOperacoesOcultas(ocultas: string[]): Promise<void> {
  await gravarObjeto(CAMINHO_OCULTAS, JSON.stringify(ocultas), "application/json");
}
