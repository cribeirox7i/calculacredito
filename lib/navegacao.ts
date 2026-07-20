type LinkNav = { href: string; label: string; prefixoAtivo?: string };

// Compartilhado entre NavBar e Footer - uma única lista evita os dois
// ficarem dessincronizados quando uma modalidade nova é adicionada.
export const LINKS_PF: LinkNav[] = [
  { href: "/credito-pessoal", label: "Crédito pessoal" },
  { href: "/consignado/inss", label: "Consignado", prefixoAtivo: "/consignado" },
  { href: "/financiamento-veiculo", label: "Financiamento de veículo" },
  {
    href: "/financiamento-imobiliario/regulada/tr",
    label: "Financiamento imobiliário",
    prefixoAtivo: "/financiamento-imobiliario",
  },
  { href: "/saque-aniversario", label: "Saque-aniversário FGTS" },
  { href: "/antecipacao-fgts", label: "Antecipação FGTS" },
  {
    href: "/cartao-credito/rotativo",
    label: "Cartão de crédito",
    prefixoAtivo: "/cartao-credito",
  },
  { href: "/anuidade-cartao", label: "Anuidade de cartão" },
];

export const LINKS_PJ: LinkNav[] = [
  {
    href: "/capital-giro/prefixado",
    label: "Capital de giro",
    prefixoAtivo: "/capital-giro",
  },
  {
    href: "/conta-garantida/prefixado",
    label: "Conta garantida",
    prefixoAtivo: "/conta-garantida",
  },
  { href: "/cheque-especial-pj", label: "Cheque especial PJ" },
  { href: "/desconto-duplicatas", label: "Desconto de duplicatas" },
  { href: "/maquininha-de-cartao", label: "Maquininha de cartão" },
  { href: "/hot-money", label: "Hot money" },
  { href: "/carta-fianca", label: "Carta fiança" },
];

export const PREFIXOS_PJ = [
  "/capital-giro",
  "/conta-garantida",
  "/cheque-especial-pj",
  "/desconto-duplicatas",
  "/maquininha-de-cartao",
  "/hot-money",
  "/carta-fianca",
] as const;
