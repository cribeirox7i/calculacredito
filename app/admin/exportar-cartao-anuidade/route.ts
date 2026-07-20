import { NextResponse } from "next/server";
import { gerarCsvModelo } from "@/lib/planilha-cartao-anuidade";
import { obterTaxasCartaoAnuidade } from "@/lib/taxas-cartao-anuidade";

export const dynamic = "force-dynamic";

export async function GET() {
  const taxas = await obterTaxasCartaoAnuidade();
  const csv = gerarCsvModelo(taxas);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="taxas-cartao-anuidade.csv"',
    },
  });
}
