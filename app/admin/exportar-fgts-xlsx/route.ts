import { NextResponse } from "next/server";
import { gerarXlsxModelo } from "@/lib/planilha-fgts";
import { obterTaxasFgts } from "@/lib/taxas-fgts";

export const dynamic = "force-dynamic";

export async function GET() {
  const taxas = await obterTaxasFgts();
  const xlsx = gerarXlsxModelo(taxas);

  // TS trata Buffer<ArrayBufferLike> como potencialmente incompatível com
  // BodyInit por causa do generic de SharedArrayBuffer, mas em runtime Node
  // um Buffer normal funciona sem problema como corpo de resposta.
  return new NextResponse(xlsx as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="taxas-fgts.xlsx"',
    },
  });
}
