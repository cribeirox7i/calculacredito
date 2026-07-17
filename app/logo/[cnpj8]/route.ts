import { NextResponse } from "next/server";
import { caminhoLogo } from "@/lib/logos";
import { lerObjetoBuffer } from "@/lib/r2";

// O bucket do R2 é privado - essa rota é o único jeito de servir uma logo
// pro navegador, fazendo o proxy do GetObjectCommand. Cache longo porque
// logos raramente mudam (o admin só reenvia quando o arquivo é trocado).
export async function GET(_request: Request, { params }: { params: Promise<{ cnpj8: string }> }) {
  const { cnpj8 } = await params;
  const resultado = await lerObjetoBuffer(caminhoLogo(cnpj8));

  if (!resultado) {
    return new NextResponse(null, { status: 404 });
  }

  // Buffer<ArrayBufferLike> não bate exatamente com BodyInit no TS, mas em
  // runtime Node funciona normalmente como corpo de resposta.
  return new NextResponse(resultado.buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": resultado.contentType ?? "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
