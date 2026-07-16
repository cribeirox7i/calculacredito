import Papa from "papaparse";
import type { ModalidadeTaxa, TaxaMaquininha } from "@/lib/taxas-maquininha";

const CABECALHO = ["adquirente", "plano", "modalidade", "parcelas", "taxa", "fonte_url", "atualizado_em"] as const;

const LINHAS_EXEMPLO = [
  {
    adquirente: "Exemplo (apague esta linha)",
    plano: "Padrão",
    modalidade: "debito",
    parcelas: "",
    taxa: "1,99",
    fonte_url: "",
    atualizado_em: "",
  },
  {
    adquirente: "Exemplo (apague esta linha)",
    plano: "Padrão",
    modalidade: "credito_parcelado",
    parcelas: "3",
    taxa: "6,50",
    fonte_url: "",
    atualizado_em: "",
  },
];

// Modalidades aceitas na importação: tanto o valor bruto quanto rótulos
// amigáveis (o admin pode editar o CSV no Excel e digitar "Débito" em vez de
// "debito") - normalizado sem acento/maiúsculas antes de casar.
const ALIAS_MODALIDADE: Record<string, ModalidadeTaxa> = {
  pix: "pix",
  debito: "debito",
  "debito ": "debito",
  creditoavista: "credito_vista",
  "credito a vista": "credito_vista",
  credito_vista: "credito_vista",
  creditoparcelado: "credito_parcelado",
  "credito parcelado": "credito_parcelado",
  credito_parcelado: "credito_parcelado",
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function parseModalidade(valor: string): ModalidadeTaxa | null {
  const chave = normalizar(valor).replace(/\s+/g, "_");
  return ALIAS_MODALIDADE[chave] ?? ALIAS_MODALIDADE[normalizar(valor)] ?? null;
}

// Aceita taxa com vírgula (padrão brasileiro/Excel) ou ponto decimal.
function parseTaxa(valor: string): number | null {
  const limpo = valor.trim().replace("%", "").replace(",", ".");
  if (limpo === "") return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

export function gerarCsvModelo(taxasAtuais: TaxaMaquininha[]): string {
  const linhas =
    taxasAtuais.length > 0
      ? taxasAtuais.map((t) => ({
          adquirente: t.adquirente,
          plano: t.plano,
          modalidade: t.modalidade,
          parcelas: t.parcelas != null ? String(t.parcelas) : "",
          taxa: String(t.taxa).replace(".", ","),
          fonte_url: t.fonteUrl ?? "",
          atualizado_em: t.atualizadoEm,
        }))
      : LINHAS_EXEMPLO;

  return Papa.unparse({ fields: [...CABECALHO], data: linhas });
}

export type ErroLinhaCsv = { linha: number; motivo: string };

export type ResultadoImportacaoCsv = {
  validas: Omit<TaxaMaquininha, "id" | "atualizadoEm">[];
  erros: ErroLinhaCsv[];
};

export function parseCsvTaxas(conteudoCsv: string): ResultadoImportacaoCsv {
  const { data } = Papa.parse<Record<string, string>>(conteudoCsv, {
    header: true,
    skipEmptyLines: true,
  });

  const validas: Omit<TaxaMaquininha, "id" | "atualizadoEm">[] = [];
  const erros: ErroLinhaCsv[] = [];

  data.forEach((linha, indice) => {
    const numeroLinha = indice + 2; // +1 pelo cabeçalho, +1 por índice 0-based
    const adquirente = (linha.adquirente ?? "").trim();
    const plano = (linha.plano ?? "").trim();

    if (!adquirente || adquirente.startsWith("Exemplo")) return;
    if (!plano) {
      erros.push({ linha: numeroLinha, motivo: "Coluna 'plano' vazia." });
      return;
    }

    const modalidade = parseModalidade(linha.modalidade ?? "");
    if (!modalidade) {
      erros.push({
        linha: numeroLinha,
        motivo: `Modalidade "${linha.modalidade}" inválida (use pix, debito, credito_vista ou credito_parcelado).`,
      });
      return;
    }

    const parcelasTexto = (linha.parcelas ?? "").trim();
    const parcelas = parcelasTexto ? Number(parcelasTexto) : null;
    if (modalidade === "credito_parcelado" && (!parcelas || parcelas < 2)) {
      erros.push({
        linha: numeroLinha,
        motivo: "Modalidade 'credito_parcelado' exige a coluna 'parcelas' com um número >= 2.",
      });
      return;
    }
    if (modalidade !== "credito_parcelado" && parcelas !== null) {
      erros.push({
        linha: numeroLinha,
        motivo: "Coluna 'parcelas' só deve ser preenchida quando modalidade = credito_parcelado.",
      });
      return;
    }

    const taxa = parseTaxa(linha.taxa ?? "");
    if (taxa === null) {
      erros.push({ linha: numeroLinha, motivo: `Taxa "${linha.taxa}" inválida.` });
      return;
    }

    validas.push({
      adquirente,
      plano,
      modalidade,
      parcelas,
      taxa,
      fonteUrl: (linha.fonte_url ?? "").trim() || null,
    });
  });

  return { validas, erros };
}
