import { listarObjetosComPrefixo, r2Configurado } from "@/lib/r2";

const PREFIXO_LOGOS = "logos/";

const MAPA_ACENTOS: Record<string, string> = {
  á: "a",
  à: "a",
  ã: "a",
  â: "a",
  ä: "a",
  é: "e",
  è: "e",
  ê: "e",
  ë: "e",
  í: "i",
  ì: "i",
  î: "i",
  ï: "i",
  ó: "o",
  ò: "o",
  õ: "o",
  ô: "o",
  ö: "o",
  ú: "u",
  ù: "u",
  û: "u",
  ü: "u",
  ç: "c",
  ñ: "n",
};

export function removerAcentos(texto: string): string {
  return texto
    .split("")
    .map((c) => MAPA_ACENTOS[c] ?? c)
    .join("");
}

export function slugify(nome: string): string {
  return removerAcentos(nome.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function caminhoLogo(cnpj8: string): string {
  return `${PREFIXO_LOGOS}${cnpj8}.png`;
}

export function codigoDoCaminho(chave: string): string {
  return chave.replace(PREFIXO_LOGOS, "").replace(/\.[^.]+$/, "");
}

// O bucket do R2 é privado (sem URL pública) - as imagens são servidas por
// uma rota própria (app/logo/[cnpj8]/route.ts) que faz o proxy do
// GetObjectCommand. Por isso o mapa devolve um caminho same-origin em vez de
// uma URL de storage direta.
export async function obterLogosPorCnpj8(): Promise<Record<string, string>> {
  if (!r2Configurado()) return {};

  const chaves = await listarObjetosComPrefixo(PREFIXO_LOGOS);
  const mapa: Record<string, string> = {};
  for (const chave of chaves) {
    mapa[codigoDoCaminho(chave)] = `/logo/${codigoDoCaminho(chave)}`;
  }
  return mapa;
}

const CORES_AVATAR = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function corAvatar(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash * 31 + nome.charCodeAt(i)) | 0;
  }
  return CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length];
}

export function iniciaisInstituicao(nome: string): string {
  const palavras = nome
    .replace(/S\.?A\.?|LTDA\.?|CFI|SCFI/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const relevantes = palavras.filter((p) => p.length > 2);
  const base = relevantes.length > 0 ? relevantes : palavras;
  return base
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
