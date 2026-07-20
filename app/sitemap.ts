import type { MetadataRoute } from "next";

const BASE_URL = "https://calculacredito.com.br";

const TIPOS_IMOBILIARIO = ["regulada", "mercado"] as const;
const INDEXADORES_IMOBILIARIO = ["prefixado", "tr", "ipca"] as const;

const PAGINAS_ESTATICAS = [
  "/",
  "/credito-pessoal",
  "/consignado/inss",
  "/consignado/privado",
  "/consignado/publico",
  "/financiamento-veiculo",
  "/saque-aniversario",
  "/antecipacao-fgts",
  "/cartao-credito/rotativo",
  "/cartao-credito/parcelado",
  "/anuidade-cartao",
  "/capital-giro/prefixado",
  "/capital-giro/posfixado",
  "/conta-garantida/prefixado",
  "/conta-garantida/posfixado",
  "/cheque-especial-pj",
  "/desconto-duplicatas",
  "/maquininha-de-cartao",
  "/hot-money",
  "/carta-fianca",
  "/quem-somos",
  "/termos-de-uso",
];

const PAGINAS_IMOBILIARIO = TIPOS_IMOBILIARIO.flatMap((tipo) =>
  INDEXADORES_IMOBILIARIO.map((indexador) => `/financiamento-imobiliario/${tipo}/${indexador}`)
);

// /admin e suas subrotas ficam de fora de propósito - protegidas por senha,
// não fazem sentido no índice de busca (ver também app/robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  return [...PAGINAS_ESTATICAS, ...PAGINAS_IMOBILIARIO].map((caminho) => ({
    url: `${BASE_URL}${caminho}`,
    lastModified: agora,
    changeFrequency: "daily",
    priority: caminho === "/" ? 1 : 0.8,
  }));
}
