import * as cheerio from "cheerio";

const URL = "https://www.infinitepay.io/taxas";

// InfinitePay publica a tabela como HTML estático (Webflow), sem simulador
// interativo nem CPF/CNPJ - confirmado via curl direto, sem headless browser.
// Estrutura: uma faixa de faturamento por aba (.tier-tab_pane) > 3 colunas de
// bandeira/produto (.fees_table-card) > sequência linear de rótulo/valor
// (.text-fees_item) alternando texto e percentual.
export async function scrapeInfinitePay() {
  const res = await fetch(URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`InfinitePay HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const faixas = [];

  $("div.tier-tab_pane").each((_, paneEl) => {
    const $pane = $(paneEl);
    const rotuloFaixa = $pane.find("h5.fees_seo-heading").first().text().trim();
    if (!rotuloFaixa) return;

    const bandeiras = [];
    $pane
      .find("div.fees_table-card")
      .each((__, cardEl) => {
        const $card = $(cardEl);
        const items = $card
          .find(".text-fees_item")
          .map((___, el) => $(el).text().trim())
          .get();

        const nomeBandeira = $card.find("h6, h5, p").first().text().trim();
        const dados = parsePares(items);
        if (dados) bandeiras.push({ bandeira: nomeBandeira, ...dados });
      });

    if (bandeiras.length > 0) faixas.push({ faixaFaturamento: rotuloFaixa, bandeiras });
  });

  return {
    adquirente: "InfinitePay",
    fonteUrl: URL,
    coletadoEm: new Date().toISOString(),
    faixas,
  };
}

function parsePercentual(texto) {
  if (/GRÁTIS/i.test(texto)) return 0;
  const m = texto.replace(",", ".").match(/([\d.]+)%/);
  return m ? Number(m[1]) : null;
}

// Os itens vêm como sequência alternada [rótulo, valor, rótulo, valor, ...]
// começando sempre por "Pix". Ex: ["Pix","GRÁTIS","Débito","1,37%","Crédito à
// vista","3,15%","2x","5,39%",...,"12x","12,40%"].
function parsePares(items) {
  const parcelas = {};
  let pix = null;
  let debito = null;
  let creditoVista = null;

  for (let i = 0; i < items.length - 1; i += 2) {
    const rotulo = items[i];
    const valor = parsePercentual(items[i + 1]);
    if (valor === null) continue;

    if (/^pix$/i.test(rotulo)) pix = valor;
    else if (/^d[ée]bito$/i.test(rotulo)) debito = valor;
    else if (/cr[ée]dito.*vista/i.test(rotulo)) creditoVista = valor;
    else {
      const parcela = rotulo.match(/^(\d+)x$/i);
      if (parcela) parcelas[Number(parcela[1])] = valor;
    }
  }

  if (debito === null && creditoVista === null) return null;
  return { pix, debito, creditoVista, parcelas };
}
