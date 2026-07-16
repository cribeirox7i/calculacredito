import { list, put } from "@vercel/blob";
import { blobConfigurado } from "@/lib/logos";

const CAMINHO_TAXAS = "taxas-maquininha.json";

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

// Mesmo gotcha de lib/sites.ts: `revalidate: false` força leitura sempre
// fresca (Server Actions do admin, fora de rota estática). Um número alinha
// com o cache de dados do Next e é obrigatório nas páginas públicas
// estáticas - um fetch "no-store" ali quebra a regeneração em runtime.
async function buscarTaxasJson(revalidate: number | false): Promise<TaxaMaquininha[]> {
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
    return (await res.json()) as TaxaMaquininha[];
  } catch {
    return [];
  }
}

// Usado pela página pública do comparador de maquininhas - revalidação
// alinhada com o mesmo período das outras taxas do site.
export function obterTaxasMaquininha(): Promise<TaxaMaquininha[]> {
  return buscarTaxasJson(60 * 60 * 24);
}

// Usado só dentro das Server Actions de admin, pra garantir leitura fresca
// antes de regravar o arquivo.
function obterTaxasAtuais(): Promise<TaxaMaquininha[]> {
  return buscarTaxasJson(false);
}

async function gravar(taxas: TaxaMaquininha[]): Promise<void> {
  await put(CAMINHO_TAXAS, JSON.stringify(taxas), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function adicionarTaxaMaquininha(
  entrada: Omit<TaxaMaquininha, "id" | "atualizadoEm">
): Promise<void> {
  const taxas = await obterTaxasAtuais();
  taxas.push({
    ...entrada,
    id: crypto.randomUUID(),
    atualizadoEm: new Date().toISOString(),
  });
  await gravar(taxas);
}

export async function removerTaxaMaquininha(id: string): Promise<void> {
  const taxas = await obterTaxasAtuais();
  await gravar(taxas.filter((t) => t.id !== id));
}

// Substitui todas as linhas de um adquirente pelas novas (usado pela
// importação de CSV) - evita duplicar linhas antigas quando o admin reimporta
// uma planilha atualizada só daquele adquirente. Linhas de outros adquirentes
// não são tocadas.
export async function substituirTaxasDoAdquirente(
  adquirente: string,
  novasLinhas: Omit<TaxaMaquininha, "id" | "atualizadoEm">[]
): Promise<void> {
  const atuais = await obterTaxasAtuais();
  const agora = new Date().toISOString();
  const semAdquirente = atuais.filter((t) => t.adquirente !== adquirente);
  const novas = novasLinhas.map((linha) => ({
    ...linha,
    id: crypto.randomUUID(),
    atualizadoEm: agora,
  }));
  await gravar([...semAdquirente, ...novas]);
}
