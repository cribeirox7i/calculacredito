import { NextResponse } from "next/server";
import { gerarCsvModelo } from "@/lib/planilha-maquininhas";
import { obterTaxasMaquininha } from "@/lib/taxas-maquininha";

export const dynamic = "force-dynamic";

export async function GET() {
  const taxas = await obterTaxasMaquininha();
  const csv = gerarCsvModelo(taxas);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="taxas-maquininha.csv"',
    },
  });
}
