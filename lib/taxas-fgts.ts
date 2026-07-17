import { gravarObjeto, lerObjetoTexto } from "@/lib/r2";

const CAMINHO_TAXAS = "taxas-fgts.json";

export type TaxaFgts = {
  id: string;
  instituicao: string;
  plano: string;
  taxaMensal: number;
  prazoMaximoAnos: number;
  fonteUrl: string | null;
  atualizadoEm: string;
};

async function buscarTaxasJson(): Promise<TaxaFgts[]> {
  const texto = await lerObjetoTexto(CAMINHO_TAXAS);
  if (!texto) return [];
  try {
    return JSON.parse(texto) as TaxaFgts[];
  } catch {
    return [];
  }
}

// Leitura sempre fresca - sem o Data Cache do Next (ver lib/sites.ts).
export function obterTaxasFgts(): Promise<TaxaFgts[]> {
  return buscarTaxasJson();
}

async function gravar(taxas: TaxaFgts[]): Promise<void> {
  await gravarObjeto(CAMINHO_TAXAS, JSON.stringify(taxas), "application/json");
}

export async function adicionarTaxaFgts(entrada: Omit<TaxaFgts, "id" | "atualizadoEm">): Promise<void> {
  const taxas = await buscarTaxasJson();
  taxas.push({
    ...entrada,
    id: crypto.randomUUID(),
    atualizadoEm: new Date().toISOString(),
  });
  await gravar(taxas);
}

export async function removerTaxaFgts(id: string): Promise<void> {
  const taxas = await buscarTaxasJson();
  await gravar(taxas.filter((t) => t.id !== id));
}

export async function atualizarTaxaFgts(
  id: string,
  entrada: Omit<TaxaFgts, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await buscarTaxasJson();
  const indice = taxas.findIndex((t) => t.id === id);
  if (indice === -1) throw new Error("Taxa não encontrada.");
  taxas[indice] = { ...entrada, id, atualizadoEm: new Date().toISOString() };
  await gravar(taxas);
}

export async function limparTodasTaxasFgts(): Promise<void> {
  await gravar([]);
}

export async function substituirTaxasDaInstituicao(
  instituicao: string,
  novasLinhas: Omit<TaxaFgts, "id" | "atualizadoEm">[]
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
