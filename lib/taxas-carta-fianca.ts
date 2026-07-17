import { gravarObjeto, lerObjetoTexto } from "@/lib/r2";

const CAMINHO_TAXAS = "taxas-carta-fianca.json";

export type TaxaCartaFianca = {
  id: string;
  instituicao: string;
  plano: string;
  taxaAnual: number;
  prazoMaximoMeses: number;
  fonteUrl: string | null;
  atualizadoEm: string;
};

async function buscarTaxasJson(): Promise<TaxaCartaFianca[]> {
  const texto = await lerObjetoTexto(CAMINHO_TAXAS);
  if (!texto) return [];
  try {
    return JSON.parse(texto) as TaxaCartaFianca[];
  } catch {
    return [];
  }
}

// Leitura sempre fresca - sem o Data Cache do Next (ver lib/sites.ts).
export function obterTaxasCartaFianca(): Promise<TaxaCartaFianca[]> {
  return buscarTaxasJson();
}

async function gravar(taxas: TaxaCartaFianca[]): Promise<void> {
  await gravarObjeto(CAMINHO_TAXAS, JSON.stringify(taxas), "application/json");
}

export async function adicionarTaxaCartaFianca(
  entrada: Omit<TaxaCartaFianca, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await buscarTaxasJson();
  taxas.push({
    ...entrada,
    id: crypto.randomUUID(),
    atualizadoEm: new Date().toISOString(),
  });
  await gravar(taxas);
}

export async function removerTaxaCartaFianca(id: string): Promise<void> {
  const taxas = await buscarTaxasJson();
  await gravar(taxas.filter((t) => t.id !== id));
}

export async function atualizarTaxaCartaFianca(
  id: string,
  entrada: Omit<TaxaCartaFianca, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await buscarTaxasJson();
  const indice = taxas.findIndex((t) => t.id === id);
  if (indice === -1) throw new Error("Taxa não encontrada.");
  taxas[indice] = { ...entrada, id, atualizadoEm: new Date().toISOString() };
  await gravar(taxas);
}

export async function limparTodasTaxasCartaFianca(): Promise<void> {
  await gravar([]);
}

export async function substituirTaxasDaInstituicao(
  instituicao: string,
  novasLinhas: Omit<TaxaCartaFianca, "id" | "atualizadoEm">[]
): Promise<void> {
  const atuais = await buscarTaxasJson();
  const agora = new Date().toISOString();
  const semInstituicao = atuais.filter((t) => t.instituicao !== instituicao);
  const novas = novasLinhas.map((linha) => ({
    ...linha,
    id: crypto.randomUUID(),
    atualizadoEm: agora,
  }));
  await gravar([...semInstituicao, ...novas]);
}
