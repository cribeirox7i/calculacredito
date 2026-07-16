// Nomes exatos de modalidade validados via ParametrosConsulta da API do BCB
// (ver PLANO.md seção 3) - usar sempre esta lista em vez de strings soltas,
// já que o filtro da API depende do texto exato bater.
export const MODALIDADES = {
  pessoal: {
    codigo: "221101",
    nome: "Crédito pessoal não consignado - Prefixado",
  },
  veiculo: {
    codigo: "401101",
    nome: "Aquisição de veículos - Prefixado",
  },
  consignadoInss: {
    codigo: "218101",
    nome: "Crédito pessoal consignado INSS - Prefixado",
  },
  consignadoPrivado: {
    codigo: "219101",
    nome: "Crédito pessoal consignado privado - Prefixado",
  },
  consignadoPublico: {
    codigo: "220101",
    nome: "Crédito pessoal consignado público - Prefixado",
  },
} as const;

// Financiamento imobiliário só existe no recurso mensal da API, dividido em
// "taxas de mercado" (SFI, sem teto de valor/uso de FGTS) vs. "taxas
// reguladas" (SFH, dentro do teto e regras de FGTS) × 3 indexadores.
export const MODALIDADES_IMOBILIARIO = {
  mercado: {
    prefixado: {
      codigo: "903101",
      nome: "Financiamento imobiliário com taxas de mercado - Prefixado",
    },
    tr: {
      codigo: "903201",
      nome: "Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em TR",
    },
    ipca: {
      codigo: "903203",
      nome: "Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em IPCA",
    },
  },
  regulada: {
    prefixado: {
      codigo: "905101",
      nome: "Financiamento imobiliário com taxas reguladas - Prefixado",
    },
    tr: {
      codigo: "905201",
      nome: "Financiamento imobiliário com taxas reguladas - Pós-fixado referenciado em TR",
    },
    ipca: {
      codigo: "905203",
      nome: "Financiamento imobiliário com taxas reguladas - Pós-fixado referenciado em IPCA",
    },
  },
} as const;

// Modalidades de crédito Pessoa Jurídica - códigos e nomes exatos validados
// via ParametrosConsulta (segmento "Pessoa Jurídica"), mesmo recurso diário
// já usado pelas modalidades PF (nenhuma modalidade PJ está no recurso mensal).
export const MODALIDADES_PJ = {
  capitalGiro: {
    curto: {
      prefixado: {
        codigo: "210101",
        nome: "Capital de giro com prazo até 365 dias - Prefixado",
      },
      posfixado: {
        codigo: "210204",
        nome: "Capital de giro com prazo até 365 dias - Pós-fixado referenciado em juros flutuantes",
      },
    },
    longo: {
      prefixado: {
        codigo: "211101",
        nome: "Capital de giro com prazo superior a 365 dias - Prefixado",
      },
      posfixado: {
        codigo: "211204",
        nome: "Capital de giro com prazo superior a 365 dias - Pós-fixado referenciado em juros flutuantes",
      },
    },
  },
  contaGarantida: {
    prefixado: {
      codigo: "217101",
      nome: "Conta garantida - Prefixado",
    },
    posfixado: {
      codigo: "217204",
      nome: "Conta garantida - Pós-fixado referenciado em juros flutuantes",
    },
  },
  chequeEspecial: {
    codigo: "216101",
    nome: "Cheque especial - Prefixado",
  },
  descontoDuplicatas: {
    codigo: "301101",
    nome: "Desconto de duplicatas - Prefixado",
  },
} as const;
