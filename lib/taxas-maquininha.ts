import { gravarObjeto, lerObjetoTexto } from "@/lib/r2";

export type ModalidadeTaxa = "pix" | "debito" | "credito_vista" | "credito_parcelado";

export type TaxaMaquininha = {
  id: string;
  adquirente: string;
  plano: string;
  modalidade: ModalidadeTaxa;
  parcelas: number | null;
  taxa: number;
  fonteUrl: string | null;
  atualizadoEm: string;
};

const CAMINHO_TAXAS = "taxas-maquininha.json";

async function buscarTaxasJson(): Promise<TaxaMaquininha[]> {
  const texto = await lerObjetoTexto(CAMINHO_TAXAS);
  if (!texto) return [];
  try {
    return JSON.parse(texto) as TaxaMaquininha[];
  } catch {
    return [];
  }
}

// Leitura sempre fresca - sem o Data Cache do Next (ver lib/sites.ts).
export function obterTaxasMaquininha(): Promise<TaxaMaquininha[]> {
  return buscarTaxasJson();
}

async function gravar(taxas: TaxaMaquininha[]): Promise<void> {
  await gravarObjeto(CAMINHO_TAXAS, JSON.stringify(taxas), "application/json");
}

export async function adicionarTaxaMaquininha(
  entrada: Omit<TaxaMaquininha, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await buscarTaxasJson();
  taxas.push({
    ...entrada,
    id: crypto.randomUUID(),
    atualizadoEm: new Date().toISOString(),
  });
  await gravar(taxas);
}

export async function removerTaxaMaquininha(id: string): Promise<void> {
  const taxas = await buscarTaxasJson();
  await gravar(taxas.filter((t) => t.id !== id));
}

export async function atualizarTaxaMaquininha(
  id: string,
  entrada: Omit<TaxaMaquininha, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await buscarTaxasJson();
  const indice = taxas.findIndex((t) => t.id === id);
  if (indice === -1) throw new Error("Taxa não encontrada.");
  taxas[indice] = { ...entrada, id, atualizadoEm: new Date().toISOString() };
  await gravar(taxas);
}

export async function limparTodasTaxas(): Promise<void> {
  await gravar([]);
}

// Substitui todas as linhas de um adquirente pelas novas (usado pela
// importação de CSV) - evita duplicar linhas antigas quando o admin reimporta
// uma planilha atualizada só daquele adquirente. Linhas de outros adquirentes
// não são tocadas.
export async function substituirTaxasDoAdquirente(
  adquirente: string,
  novasLinhas: Omit<TaxaMaquininha, "id" | "atualizadoEm">[]
): Promise<void> {
  const atuais = await buscarTaxasJson();
  const agora = new Date().toISOString();
  const semAdquirente = atuais.filter((t) => t.adquirente !== adquirente);
  const novas = novasLinhas.map((linha) => ({
    ...linha,
    id: crypto.randomUUID(),
    atualizadoEm: agora,
  }));
  await gravar([...semAdquirente, ...novas]);
}
