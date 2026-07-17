import { NextResponse } from "next/server";
import { gerarCsvModelo } from "@/lib/planilha-hotmoney";
import { obterTaxasHotMoney } from "@/lib/taxas-hotmoney";

export const dynamic = "force-dynamic";

export async function GET() {
  const taxas = await obterTaxasHotMoney();
  const csv = gerarCsvModelo(taxas);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="taxas-hotmoney.csv"',
    },
  });
}
