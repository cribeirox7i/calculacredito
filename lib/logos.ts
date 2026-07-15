import { list } from "@vercel/blob";

const PREFIXO_BLOB = "logos/";

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

function removerAcentos(texto: string): string {
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

export function caminhoBlob(nomeInstituicao: string): string {
  return `${PREFIXO_BLOB}${slugify(nomeInstituicao)}.png`;
}

export function slugDoCaminho(pathname: string): string {
  return pathname.replace(PREFIXO_BLOB, "").replace(/\.[^.]+$/, "");
}

// BLOB_READ_WRITE_TOKEN só existe depois que o Blob Store é ativado no
// projeto da Vercel — sem ele, o site continua funcionando normalmente,
// só que sem logos (cai no fallback de avatar com iniciais).
export async function obterLogosPorSlug(): Promise<Record<string, string>> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};

  try {
    const { blobs } = await list({ prefix: PREFIXO_BLOB });
    const mapa: Record<string, string> = {};
    for (const blob of blobs) {
      mapa[slugDoCaminho(blob.pathname)] = blob.url;
    }
    return mapa;
  } catch {
    return {};
  }
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
