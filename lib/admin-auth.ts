const ALGORITMO = { name: "HMAC", hash: "SHA-256" };
const DURACAO_SESSAO_MS = 30 * 24 * 60 * 60 * 1000;

async function obterChave(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) {
    throw new Error("ADMIN_COOKIE_SECRET não configurado");
  }
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), ALGORITMO, false, [
    "sign",
    "verify",
  ]);
}

function paraHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function criarSessaoAdmin(): Promise<string> {
  const expiraEm = Date.now() + DURACAO_SESSAO_MS;
  const chave = await obterChave();
  const assinatura = await crypto.subtle.sign(
    ALGORITMO,
    chave,
    new TextEncoder().encode(String(expiraEm))
  );
  return `${expiraEm}.${paraHex(assinatura)}`;
}

export async function verificarSessaoAdmin(cookie: string | undefined): Promise<boolean> {
  if (!cookie) return false;
  const [expiraEmStr, assinaturaRecebida] = cookie.split(".");
  const expiraEm = Number(expiraEmStr);
  if (!expiraEm || Number.isNaN(expiraEm) || Date.now() > expiraEm) return false;

  const chave = await obterChave();
  const assinatura = await crypto.subtle.sign(
    ALGORITMO,
    chave,
    new TextEncoder().encode(String(expiraEm))
  );
  return paraHex(assinatura) === assinaturaRecebida;
}
