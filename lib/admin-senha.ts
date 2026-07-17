import { gravarObjeto, lerObjetoTexto } from "@/lib/r2";

const CAMINHO_SENHA = "admin-senha.json";
const ITERACOES_PBKDF2 = 210_000; // recomendação atual da OWASP pra PBKDF2-SHA256

type SenhaArmazenada = { hash: string; salt: string };

function paraHex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexParaBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function derivarHash(senha: string, salt: Uint8Array): Promise<string> {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERACOES_PBKDF2, hash: "SHA-256" },
    chave,
    256
  );
  return paraHex(bits);
}

async function obterSenhaArmazenada(): Promise<SenhaArmazenada | null> {
  const texto = await lerObjetoTexto(CAMINHO_SENHA);
  if (!texto) return null;
  try {
    return JSON.parse(texto) as SenhaArmazenada;
  } catch {
    return null;
  }
}

// Enquanto o admin nunca trocou a senha pelo painel, não existe hash
// guardado no R2 - o login cai no fallback da ADMIN_PASSWORD (env var),
// que é como o projeto sempre funcionou.
export async function verificarSenhaAdmin(senhaDigitada: string): Promise<boolean> {
  const armazenada = await obterSenhaArmazenada();
  if (!armazenada) {
    return senhaDigitada === process.env.ADMIN_PASSWORD;
  }
  const hash = await derivarHash(senhaDigitada, hexParaBytes(armazenada.salt));
  return hash === armazenada.hash;
}

export async function definirSenhaAdmin(novaSenha: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivarHash(novaSenha, salt);
  await gravarObjeto(
    CAMINHO_SENHA,
    JSON.stringify({ hash, salt: paraHex(salt) } satisfies SenhaArmazenada),
    "application/json"
  );
}
