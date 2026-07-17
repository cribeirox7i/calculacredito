import { list, put } from "@vercel/blob";
import { blobConfigurado } from "@/lib/logos";

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

// Mesmo padrão de lib/taxas-maquininha.ts: `revalidate: false` força leitura
// sempre fresca (Server Actions do admin), um número alinha com o cache de
// dados do Next e é obrigatório nas páginas públicas estáticas.
async function buscarTaxasJson(revalidate: number | false): Promise<TaxaFgts[]> {
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
    return (await res.json()) as TaxaFgts[];
  } catch {
    return [];
  }
}

export function obterTaxasFgts(): Promise<TaxaFgts[]> {
  return buscarTaxasJson(60 * 60 * 24);
}

function obterTaxasAtuais(): Promise<TaxaFgts[]> {
  return buscarTaxasJson(false);
}

async function gravar(taxas: TaxaFgts[]): Promise<void> {
  await put(CAMINHO_TAXAS, JSON.stringify(taxas), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function adicionarTaxaFgts(entrada: Omit<TaxaFgts, "id" | "atualizadoEm">): Promise<void> {
  const taxas = await obterTaxasAtuais();
  taxas.push({
    ...entrada,
    id: crypto.randomUUID(),
    atualizadoEm: new Date().toISOString(),
  });
  await gravar(taxas);
}

export async function removerTaxaFgts(id: string): Promise<void> {
  const taxas = await obterTaxasAtuais();
  await gravar(taxas.filter((t) => t.id !== id));
}

export async function atualizarTaxaFgts(
  id: string,
  entrada: Omit<TaxaFgts, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await obterTaxasAtuais();
  const indice = taxas.findIndex((t) => t.id === id);
  if (indice === -1) throw new Error("Taxa não encontrada.");
  taxas[indice] = { ...entrada, id, atualizadoEm: new Date().toISOString() };
  await gravar(taxas);
}

export async function limparTodasTaxasFgts(): Promise<void> {
  await gravar([]);
}

// Substitui todas as linhas de uma instituição pelas novas (usado pela
// importação de CSV) - mesmo motivo de lib/taxas-maquininha.ts: evita
// duplicar linhas antigas quando o admin reimporta uma planilha atualizada
// só daquela instituição.
export async function substituirTaxasDaInstituicao(
  instituicao: string,
  novasLinhas: Omit<TaxaFgts, "id" | "atualizadoEm">[]
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
