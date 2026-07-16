"use server";

import { revalidatePath } from "next/cache";
import { parseCsvTaxas } from "@/lib/csv-maquininhas";
import {
  adicionarTaxaMaquininha,
  removerTaxaMaquininha,
  substituirTaxasDoAdquirente,
  type ModalidadeTaxa,
} from "@/lib/taxas-maquininha";

const MODALIDADES_VALIDAS: ModalidadeTaxa[] = ["pix", "debito", "credito_vista", "credito_parcelado"];

export async function adicionarTaxa(formData: FormData) {
  const adquirente = String(formData.get("adquirente") ?? "").trim();
  const plano = String(formData.get("plano") ?? "").trim();
  const modalidade = String(formData.get("modalidade") ?? "") as ModalidadeTaxa;
  const parcelasTexto = String(formData.get("parcelas") ?? "").trim();
  const taxaTexto = String(formData.get("taxa") ?? "").trim();
  const fonteUrl = String(formData.get("fonteUrl") ?? "").trim();

  if (!adquirente || !plano) {
    throw new Error("Informe adquirente e plano.");
  }
  if (!MODALIDADES_VALIDAS.includes(modalidade)) {
    throw new Error("Modalidade inválida.");
  }

  const parcelas = parcelasTexto ? Number(parcelasTexto) : null;
  if (modalidade === "credito_parcelado" && (!parcelas || parcelas < 2)) {
    throw new Error("Informe o número de parcelas (>= 2) para crédito parcelado.");
  }
  if (modalidade !== "credito_parcelado" && parcelas !== null) {
    throw new Error("Parcelas só se aplica a crédito parcelado.");
  }

  const taxa = Number(taxaTexto.replace(",", "."));
  if (!Number.isFinite(taxa)) {
    throw new Error("Taxa inválida.");
  }

  await adicionarTaxaMaquininha({
    adquirente,
    plano,
    modalidade,
    parcelas,
    taxa,
    fonteUrl: fonteUrl || null,
  });

  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function removerTaxa(id: string) {
  await removerTaxaMaquininha(id);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function importarCsv(formData: FormData) {
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    throw new Error("Selecione um arquivo CSV.");
  }

  const texto = await arquivo.text();
  const { validas, erros } = parseCsvTaxas(texto);

  const porAdquirente = new Map<string, typeof validas>();
  for (const linha of validas) {
    const grupo = porAdquirente.get(linha.adquirente) ?? [];
    grupo.push(linha);
    porAdquirente.set(linha.adquirente, grupo);
  }

  for (const [adquirente, linhas] of porAdquirente) {
    await substituirTaxasDoAdquirente(adquirente, linhas);
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");

  if (erros.length > 0) {
    throw new Error(
      `Importadas ${validas.length} linha(s) com sucesso (${porAdquirente.size} adquirente(s)). ` +
        `${erros.length} linha(s) com erro, não importadas:\n` +
        erros.map((e) => `Linha ${e.linha}: ${e.motivo}`).join("\n")
    );
  }
}
