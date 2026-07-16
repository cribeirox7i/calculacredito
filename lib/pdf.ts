export type LinhaPdf = {
  posicao: number;
  instituicao: string;
  taxaAoMes: number;
  taxaAoAno: number;
  parcela: number | null;
  totalPago: number | null;
  totalJuros: number | null;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Mesma logomarca usada em components/NavBar.tsx, rasterizada em canvas pra
// virar uma imagem PNG que o jsPDF consegue desenhar (jsPDF não renderiza SVG).
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="15" fill="#059669" />
  <path d="M11 20.5c1.4 1.6 3.1 2.5 5 2.5 3.6 0 6.5-2.9 6.5-6.5" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <path d="M21 11.5c-1.4-1.6-3.1-2.5-5-2.5-3.6 0-6.5 2.9-6.5 6.5" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <path d="M22 8v4h-4" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <path d="M10 24v-4h4" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`;

async function obterLogoDataUrl(): Promise<string | null> {
  try {
    const blob = new Blob([LOGO_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const imagem = new Image();
    await new Promise<void>((resolve, reject) => {
      imagem.onload = () => resolve();
      imagem.onerror = () => reject(new Error("Falha ao carregar logomarca"));
      imagem.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(imagem, 0, 0, 128, 128);
    URL.revokeObjectURL(url);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

// jsPDF só roda no navegador - importado dinamicamente pra não entrar no
// bundle do servidor nem no carregamento inicial da página.
export async function gerarPdfSimulacao(dados: {
  titulo: string;
  periodoLabel: string;
  valor: number;
  meses: number;
  taxa: number;
  parcela: number;
  totalPago: number;
  totalJuros: number;
  linhas: LinhaPdf[];
}): Promise<Blob> {
  const [{ jsPDF }, logoDataUrl] = await Promise.all([import("jspdf"), obterLogoDataUrl()]);
  const doc = new jsPDF();
  const margemEsquerda = 14;
  const tituloX = logoDataUrl ? margemEsquerda + 12 : margemEsquerda;
  let y = 20;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margemEsquerda, y - 8, 10, 10);
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(dados.titulo, tituloX, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const dataGeracao = new Date().toLocaleDateString("pt-BR");
  doc.text(`Gerado em ${dataGeracao} pelo CalculaCredito - ${dados.periodoLabel}`, margemEsquerda, y);
  y += 10;

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Sua simulação", margemEsquerda, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const linhasResumo = [
    `Valor desejado: ${formatarMoeda(dados.valor)}`,
    `Prazo: ${dados.meses} meses`,
    `Taxa de juros: ${dados.taxa.toFixed(2)}% ao mês`,
    `Parcela mensal: ${formatarMoeda(dados.parcela)}`,
    `Total pago ao final: ${formatarMoeda(dados.totalPago)}`,
    `Total de juros: ${formatarMoeda(dados.totalJuros)}`,
  ];
  for (const linha of linhasResumo) {
    doc.text(linha, margemEsquerda, y);
    y += 6;
  }
  y += 6;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Comparativo por instituição", margemEsquerda, y);
  y += 8;

  const colunas = [
    { label: "#", x: margemEsquerda, w: 8 },
    { label: "Instituição", x: margemEsquerda + 10, w: 70 },
    { label: "% mês", x: margemEsquerda + 82, w: 18 },
    { label: "% ano", x: margemEsquerda + 102, w: 18 },
    { label: "Parcela (R$)", x: margemEsquerda + 122, w: 30 },
    { label: "Total (R$)", x: margemEsquerda + 155, w: 30 },
  ];

  function desenharCabecalho() {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    for (const c of colunas) doc.text(c.label, c.x, y);
    y += 4;
    doc.setDrawColor(200);
    doc.line(margemEsquerda, y, 195, y);
    y += 7;
  }

  desenharCabecalho();
  doc.setFont("helvetica", "normal");

  for (const l of dados.linhas) {
    if (y > 280) {
      doc.addPage();
      y = 20;
      desenharCabecalho();
      doc.setFont("helvetica", "normal");
    }

    doc.text(String(l.posicao), colunas[0].x, y);
    doc.text(l.instituicao.slice(0, 38), colunas[1].x, y);
    doc.text(`${l.taxaAoMes.toFixed(2)}%`, colunas[2].x, y);
    doc.text(`${l.taxaAoAno.toFixed(2)}%`, colunas[3].x, y);
    doc.text(l.parcela !== null ? l.parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "-", colunas[4].x, y);
    doc.text(l.totalPago !== null ? l.totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "-", colunas[5].x, y);
    y += 6;
  }

  y += 6;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    "Fonte: Portal de Dados Abertos do Banco Central do Brasil. Este site nao e uma instituicao financeira,",
    margemEsquerda,
    y
  );
  y += 4;
  doc.text(
    "nao oferece credito e os valores sao estimativas - confirme o CET real na proposta da instituicao.",
    margemEsquerda,
    y
  );

  return doc.output("blob");
}
