import Papa from "papaparse";
import * as XLSX from "xlsx";

// Excel brasileiro, ao editar/salvar um CSV localmente, costuma gravar em
// Windows-1252 (ANSI) em vez de UTF-8 - sem esse fallback, acentos viram
// caracteres corrompidos (ex.: "Padrão" -> "Padr�o"). Detecta pelo caractere
// de substituição que o decoder UTF-8 gera quando encontra bytes inválidos.
function decodificarTexto(bytes: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (!utf8.includes("�")) return utf8;

  try {
    return new TextDecoder("windows-1252").decode(bytes);
  } catch {
    return utf8;
  }
}

function ehPlanilhaExcel(nomeArquivo: string): boolean {
  const nome = nomeArquivo.toLowerCase();
  return nome.endsWith(".xlsx") || nome.endsWith(".xls");
}

// Le CSV ou XLSX/XLS e devolve sempre no mesmo formato (linhas como
// Record<string,string>), pra alimentar a mesma validação independente do
// formato escolhido pelo admin. XLSX evita de raiz o problema de vírgula
// decimal colidindo com o separador de coluna, já que a célula guarda um
// número de verdade, não texto delimitado.
export async function lerLinhasPlanilha(arquivo: File): Promise<Record<string, string>[]> {
  if (ehPlanilhaExcel(arquivo.name)) {
    const buffer = await arquivo.arrayBuffer();
    const pasta = XLSX.read(buffer, { type: "array" });
    const primeiraAba = pasta.Sheets[pasta.SheetNames[0]];
    const linhas = XLSX.utils.sheet_to_json<Record<string, unknown>>(primeiraAba, { defval: "" });
    return linhas.map((linha) =>
      Object.fromEntries(Object.entries(linha).map(([chave, valor]) => [chave.trim(), String(valor).trim()]))
    );
  }

  const buffer = await arquivo.arrayBuffer();
  const texto = decodificarTexto(new Uint8Array(buffer));
  // Sem delimiter fixo: autodetecta ";" (padrão do Excel BR, evita colisão
  // com vírgula decimal) ou "," (modelo antigo/exportado por este site).
  const { data } = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: true,
  });
  return data;
}
