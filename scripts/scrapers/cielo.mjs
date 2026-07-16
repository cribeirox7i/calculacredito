import * as cheerio from "cheerio";

const URL = "https://blog.cielo.com.br/produtos-e-servicos/taxas-da-cielo/";

// Página do blog da Cielo (WordPress) publica a tabela como texto/HTML
// estático dentro de <li>, sem simulador interativo - confirmado via fetch
// direto. Cada maquininha/modelo tem sua própria seção H2/H3; dentro dela,
// os <li> seguem o padrão "Rótulo: X,XX%" ou "Nx: X,XX%".
const SECOES = [
  { titulo: "Cielo Smart — Sem aluguel", maquininha: "Cielo Smart", modelo: "Sem aluguel" },
  { titulo: "Cielo Tap — Sem mensalidade", maquininha: "Cielo Tap", modelo: "Sem mensalidade" },
  { titulo: "Cielo Smart — Com aluguel", maquininha: "Cielo Smart", modelo: "Com aluguel" },
];

export async function scrapeCielo() {
  const res = await fetch(URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Cielo HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const planos = [];

  $("h2, h3").each((_, el) => {
    const titulo = $(el).text().trim();
    const secao = SECOES.find((s) => s.titulo === titulo);
    if (!secao) return;

    const itens = [];
    let node = $(el).next();
    let guard = 0;
    while (node.length && guard < 30) {
      if (node.is("h2, h3")) break;
      itens.push(...node.find("li").addBack("li").map((__, li) => $(li).text().trim()).get());
      node = node.next();
      guard++;
    }

    const dados = parseItens(itens);
    if (dados) planos.push({ maquininha: secao.maquininha, modelo: secao.modelo, ...dados });
  });

  return {
    adquirente: "Cielo",
    fonteUrl: URL,
    coletadoEm: new Date().toISOString(),
    planos,
  };
}

function parsePercentual(texto) {
  if (/0%/.test(texto) && /primeiros|requer/i.test(texto)) return 0;
  const m = texto.replace(",", ".").match(/([\d.]+)%/);
  return m ? Number(m[1]) : null;
}

function parseItens(itens) {
  const parcelas = {};
  let pix = null;
  let debito = null;
  let creditoVista = null;

  for (const item of itens) {
    if (/^pix:/i.test(item)) pix = parsePercentual(item);
    else if (/^d[ée]bito:/i.test(item)) debito = parsePercentual(item);
    else if (/^cr[ée]dito.*vista/i.test(item)) creditoVista = parsePercentual(item);
    else {
      const m = item.match(/^(\d+)x:\s*([\d,]+)%/i);
      if (m) parcelas[Number(m[1])] = Number(m[2].replace(",", "."));
    }
  }

  if (debito === null && creditoVista === null) return null;
  return { pix, debito, creditoVista, parcelas };
}
