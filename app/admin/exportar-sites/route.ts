import { NextResponse } from "next/server";
import { gerarCsvModeloSites } from "@/lib/planilha-sites";
import { obterSitesPorCnpj8 } from "@/lib/sites";

export const dynamic = "force-dynamic";

export async function GET() {
  const sites = await obterSitesPorCnpj8();
  const csv = gerarCsvModeloSites(sites);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sites-instituicoes.csv"',
    },
  });
}
