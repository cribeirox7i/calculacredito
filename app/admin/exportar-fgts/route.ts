import { NextResponse } from "next/server";
import { gerarCsvModelo } from "@/lib/planilha-fgts";
import { obterTaxasFgts } from "@/lib/taxas-fgts";

export const dynamic = "force-dynamic";

export async function GET() {
  const taxas = await obterTaxasFgts();
  const csv = gerarCsvModelo(taxas);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="taxas-fgts.csv"',
    },
  });
}
