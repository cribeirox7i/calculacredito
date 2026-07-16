import { NextResponse } from "next/server";
import { gerarXlsxModeloSites } from "@/lib/planilha-sites";
import { obterSitesPorCnpj8 } from "@/lib/sites";

export const dynamic = "force-dynamic";

export async function GET() {
  const sites = await obterSitesPorCnpj8();
  const xlsx = gerarXlsxModeloSites(sites);

  // TS trata Buffer<ArrayBufferLike> como potencialmente incompatível com
  // BodyInit por causa do generic de SharedArrayBuffer, mas em runtime Node
  // um Buffer normal funciona sem problema como corpo de resposta.
  return new NextResponse(xlsx as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="sites-instituicoes.xlsx"',
    },
  });
}
