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
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Os títulos das páginas seguem o padrão "Modalidade - Submodalidade" (ex.:
// "Simulador de crédito consignado - Aposentados e pensionistas (INSS)"),
// então basta separar no primeiro " - " pra virar título + subtítulo no PDF.
function dividirTitulo(titulo: string): { titulo: string; subtitulo?: string } {
  const indice = titulo.indexOf(" - ");
  if (indice === -1) return { titulo };
  return { titulo: titulo.slice(0, indice), subtitulo: titulo.slice(indice + 3) };
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
  const margemDireita = 195;
  const { titulo, subtitulo } = dividirTitulo(dados.titulo);
  let y = 18;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margemEsquerda, y - 6, 8, 8);
  }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text("CalculaCredito", logoDataUrl ? margemEsquerda + 10 : margemEsquerda, y);
  y += 10;

  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, margemEsquerda, y);
  y += 7;

  if (subtitulo) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(subtitulo, margemEsquerda, y);
    y += 7;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const dataGeracao = new Date().toLocaleDateString("pt-BR");
  doc.text(`Gerado em ${dataGeracao} - ${dados.periodoLabel}`, margemEsquerda, y);
  y += 10;

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Sua simulação", margemEsquerda, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const camposResumo = [
    { label: "Valor desejado", valor: formatarMoeda(dados.valor) },
    { label: "Prazo", valor: `${dados.meses} meses` },
    { label: "Taxa de juros", valor: `${dados.taxa.toFixed(2)}% ao mês` },
    { label: "Parcela mensal", valor: formatarMoeda(dados.parcela) },
    { label: "Total pago ao final", valor: formatarMoeda(dados.totalPago) },
    { label: "Total de juros", valor: formatarMoeda(dados.totalJuros) },
  ];
  for (const campo of camposResumo) {
    doc.text(campo.label, margemEsquerda, y);
    doc.text(campo.valor, margemDireita, y, { align: "right" });
    y += 6;
  }
  y += 6;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Comparativo por instituição", margemEsquerda, y);
  y += 8;

  const colunas = [
    { label: "#", x: margemEsquerda, direita: margemEsquerda + 6, alinhar: false },
    { label: "Instituição", x: margemEsquerda + 10, direita: 0, alinhar: false },
    { label: "% mês", x: 0, direita: margemEsquerda + 96, alinhar: true },
    { label: "% ano", x: 0, direita: margemEsquerda + 116, alinhar: true },
    { label: "Parcela (R$)", x: 0, direita: margemEsquerda + 146, alinhar: true },
    { label: "Total (R$)", x: 0, direita: margemEsquerda + 181, alinhar: true },
  ];

  function desenharCabecalho() {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    for (const c of colunas) {
      if (c.alinhar) doc.text(c.label, c.direita, y, { align: "right" });
      else doc.text(c.label, c.x, y);
    }
    y += 4;
    doc.setDrawColor(200);
    doc.line(margemEsquerda, y, margemDireita, y);
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
    doc.text(`${l.taxaAoMes.toFixed(2)}%`, colunas[2].direita, y, { align: "right" });
    doc.text(`${l.taxaAoAno.toFixed(2)}%`, colunas[3].direita, y, { align: "right" });
    doc.text(
      l.parcela !== null ? l.parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-",
      colunas[4].direita,
      y,
      { align: "right" }
    );
    doc.text(
      l.totalPago !== null ? l.totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-",
      colunas[5].direita,
      y,
      { align: "right" }
    );
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
