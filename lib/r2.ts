import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET_NAME;

export function r2Configurado(): boolean {
  return Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET);
}

let cliente: S3Client | null = null;

// R2 é compatível com a API S3 - o mesmo SDK da AWS funciona apontando pro
// endpoint da Cloudflare, só trocando credenciais/endpoint. `region: "auto"`
// é o valor esperado pelo R2 (não usa regiões no sentido AWS).
function obterCliente(): S3Client {
  if (!cliente) {
    cliente = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: ACCESS_KEY_ID!, secretAccessKey: SECRET_ACCESS_KEY! },
    });
  }
  return cliente;
}

// O SDK v3 devolve o corpo como stream (Node) - precisa consumir por
// completo antes de virar Buffer.
async function streamParaBuffer(stream: AsyncIterable<Uint8Array>): Promise<Buffer> {
  const pedacos: Buffer[] = [];
  for await (const pedaco of stream) {
    pedacos.push(Buffer.isBuffer(pedaco) ? pedaco : Buffer.from(pedaco));
  }
  return Buffer.concat(pedacos);
}

export async function lerObjetoTexto(chave: string): Promise<string | null> {
  if (!r2Configurado()) return null;
  try {
    const resposta = await obterCliente().send(new GetObjectCommand({ Bucket: BUCKET, Key: chave }));
    if (!resposta.Body) return null;
    const buffer = await streamParaBuffer(resposta.Body as AsyncIterable<Uint8Array>);
    return buffer.toString("utf-8");
  } catch {
    return null;
  }
}

export async function lerObjetoBuffer(
  chave: string
): Promise<{ buffer: Buffer; contentType: string | null } | null> {
  if (!r2Configurado()) return null;
  try {
    const resposta = await obterCliente().send(new GetObjectCommand({ Bucket: BUCKET, Key: chave }));
    if (!resposta.Body) return null;
    const buffer = await streamParaBuffer(resposta.Body as AsyncIterable<Uint8Array>);
    return { buffer, contentType: resposta.ContentType ?? null };
  } catch {
    return null;
  }
}

export async function gravarObjeto(chave: string, conteudo: string | Buffer, contentType: string): Promise<void> {
  await obterCliente().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: chave, Body: conteudo, ContentType: contentType })
  );
}

export async function excluirObjeto(chave: string): Promise<void> {
  await obterCliente().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: chave }));
}

// Usado só pra descobrir quais chaves existem sob um prefixo (ex.: quais
// instituições têm logo cadastrado) - list é uma operação Classe A no R2,
// bem mais cara que Classe B (leitura), então só usar quando realmente
// precisar enumerar, não pra ler um arquivo já conhecido.
export async function listarObjetosComPrefixo(prefixo: string): Promise<string[]> {
  if (!r2Configurado()) return [];
  try {
    const resposta = await obterCliente().send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefixo }));
    return (resposta.Contents ?? []).map((obj) => obj.Key).filter((chave): chave is string => Boolean(chave));
  } catch {
    return [];
  }
}
