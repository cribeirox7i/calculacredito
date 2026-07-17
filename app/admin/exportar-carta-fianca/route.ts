import { NextResponse } from "next/server";
import { gerarCsvModelo } from "@/lib/planilha-carta-fianca";
import { obterTaxasCartaFianca } from "@/lib/taxas-carta-fianca";

export const dynamic = "force-dynamic";

export async function GET() {
  const taxas = await obterTaxasCartaFianca();
  const csv = gerarCsvModelo(taxas);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="taxas-carta-fianca.csv"',
    },
  });
}
