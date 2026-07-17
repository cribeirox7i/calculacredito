import { list, put } from "@vercel/blob";
import { blobConfigurado } from "@/lib/logos";

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

// Mesmo padrão de lib/taxas-fgts.ts e lib/taxas-hotmoney.ts.
async function buscarTaxasJson(revalidate: number | false): Promise<TaxaCartaFianca[]> {
  if (!blobConfigurado()) return [];

  try {
    const { blobs } = await list({ prefix: CAMINHO_TAXAS });
    const arquivo = blobs.find((b) => b.pathname === CAMINHO_TAXAS);
    if (!arquivo) return [];

    const res = await fetch(
      arquivo.url,
      revalidate === false ? { cache: "no-store" } : { next: { revalidate } }
    );
    if (!res.ok) return [];
    return (await res.json()) as TaxaCartaFianca[];
  } catch {
    return [];
  }
}

export function obterTaxasCartaFianca(): Promise<TaxaCartaFianca[]> {
  return buscarTaxasJson(60 * 60 * 24);
}

function obterTaxasAtuais(): Promise<TaxaCartaFianca[]> {
  return buscarTaxasJson(false);
}

async function gravar(taxas: TaxaCartaFianca[]): Promise<void> {
  await put(CAMINHO_TAXAS, JSON.stringify(taxas), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function adicionarTaxaCartaFianca(
  entrada: Omit<TaxaCartaFianca, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await obterTaxasAtuais();
  taxas.push({
    ...entrada,
    id: crypto.randomUUID(),
    atualizadoEm: new Date().toISOString(),
  });
  await gravar(taxas);
}

export async function removerTaxaCartaFianca(id: string): Promise<void> {
  const taxas = await obterTaxasAtuais();
  await gravar(taxas.filter((t) => t.id !== id));
}

export async function atualizarTaxaCartaFianca(
  id: string,
  entrada: Omit<TaxaCartaFianca, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await obterTaxasAtuais();
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
  const atuais = await obterTaxasAtuais();
  const agora = new Date().toISOString();
  const semInstituicao = atuais.filter((t) => t.instituicao !== instituicao);
  const novas = novasLinhas.map((linha) => ({
    ...linha,
    id: crypto.randomUUID(),
    atualizadoEm: agora,
  }));
  await gravar([...semInstituicao, ...novas]);
}
