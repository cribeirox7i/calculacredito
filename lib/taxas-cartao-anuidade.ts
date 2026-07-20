import { gravarObjeto, lerObjetoTexto } from "@/lib/r2";

const CAMINHO_TAXAS = "taxas-cartao-anuidade.json";

export type TaxaCartaoAnuidade = {
  id: string;
  instituicao: string;
  cartao: string;
  valorAnuidade: number;
  beneficios: string;
  fonteUrl: string | null;
  atualizadoEm: string;
};

async function buscarTaxasJson(): Promise<TaxaCartaoAnuidade[]> {
  const texto = await lerObjetoTexto(CAMINHO_TAXAS);
  if (!texto) return [];
  try {
    return JSON.parse(texto) as TaxaCartaoAnuidade[];
  } catch {
    return [];
  }
}

// Leitura sempre fresca - sem o Data Cache do Next (ver lib/sites.ts).
export function obterTaxasCartaoAnuidade(): Promise<TaxaCartaoAnuidade[]> {
  return buscarTaxasJson();
}

async function gravar(taxas: TaxaCartaoAnuidade[]): Promise<void> {
  await gravarObjeto(CAMINHO_TAXAS, JSON.stringify(taxas), "application/json");
}

export async function adicionarTaxaCartaoAnuidade(
  entrada: Omit<TaxaCartaoAnuidade, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await buscarTaxasJson();
  taxas.push({
    ...entrada,
    id: crypto.randomUUID(),
    atualizadoEm: new Date().toISOString(),
  });
  await gravar(taxas);
}

export async function removerTaxaCartaoAnuidade(id: string): Promise<void> {
  const taxas = await buscarTaxasJson();
  await gravar(taxas.filter((t) => t.id !== id));
}

export async function atualizarTaxaCartaoAnuidade(
  id: string,
  entrada: Omit<TaxaCartaoAnuidade, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await buscarTaxasJson();
  const indice = taxas.findIndex((t) => t.id === id);
  if (indice === -1) throw new Error("Taxa não encontrada.");
  taxas[indice] = { ...entrada, id, atualizadoEm: new Date().toISOString() };
  await gravar(taxas);
}

export async function limparTodasTaxasCartaoAnuidade(): Promise<void> {
  await gravar([]);
}

export async function substituirTaxasCartaoAnuidadeDaInstituicao(
  instituicao: string,
  novasLinhas: Omit<TaxaCartaoAnuidade, "id" | "atualizadoEm">[]
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
