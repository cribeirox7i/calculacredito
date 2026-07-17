import Link from "next/link";
import { obterOperacoesOcultas } from "@/lib/visibilidade-operacoes";

type Operacao = {
  titulo: string;
  descricao: string;
  href: string;
};

const operacoesPF: Operacao[] = [
  {
    titulo: "Crédito pessoal",
    descricao: "Empréstimo sem destinação específica, sem garantia ou desconto em folha.",
    href: "/credito-pessoal",
  },
  {
    titulo: "Crédito consignado",
    descricao: "Parcelas descontadas direto da folha de pagamento, benefício ou aposentadoria.",
    href: "/consignado/inss",
  },
  {
    titulo: "Financiamento de veículo",
    descricao: "Aquisição de veículo com o próprio bem como garantia.",
    href: "/financiamento-veiculo",
  },
  {
    titulo: "Financiamento imobiliário",
    descricao: "Compra de imóvel com taxas de mercado ou reguladas (SFH/SFI).",
    href: "/financiamento-imobiliario/regulada/tr",
  },
  {
    titulo: "Saque-aniversário FGTS",
    descricao: "Calcule quanto você pode sacar por ano pela tabela oficial de alíquotas.",
    href: "/saque-aniversario",
  },
  {
    titulo: "Antecipação FGTS",
    descricao: "Compare quanto cada instituição paga hoje pelas parcelas futuras do saque-aniversário.",
    href: "/antecipacao-fgts",
  },
];

const operacoesPJ: Operacao[] = [
  {
    titulo: "Capital de giro",
    descricao: "Crédito para financiar as operações do dia a dia da empresa.",
    href: "/capital-giro/prefixado",
  },
  {
    titulo: "Conta garantida",
    descricao: "Limite de crédito rotativo vinculado à conta corrente da empresa.",
    href: "/conta-garantida/prefixado",
  },
  {
    titulo: "Cheque especial PJ",
    descricao: "Limite emergencial acionado quando o saldo da conta fica negativo.",
    href: "/cheque-especial-pj",
  },
  {
    titulo: "Desconto de duplicatas",
    descricao: "Antecipação de recebíveis de vendas a prazo.",
    href: "/desconto-duplicatas",
  },
  {
    titulo: "Maquininha de cartão",
    descricao: "Compare as taxas de débito, crédito e parcelado entre as principais adquirentes.",
    href: "/maquininha-de-cartao",
  },
  {
    titulo: "Hot money",
    descricao: "Empréstimo de curtíssimo prazo, pago de uma vez no vencimento - compare taxas.",
    href: "/hot-money",
  },
  {
    titulo: "Carta fiança",
    descricao: "Compare a taxa anual cobrada por cada instituição para emitir a garantia.",
    href: "/carta-fianca",
  },
];

function GridOperacoes({ operacoes }: { operacoes: Operacao[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {operacoes.map((op) => (
        <Link key={op.titulo} href={op.href}>
          <div className="h-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{op.titulo}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{op.descricao}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function Home() {
  const ocultas = await obterOperacoesOcultas();
  const operacoesPFVisiveis = operacoesPF.filter((op) => !ocultas.includes(op.href));
  const operacoesPJVisiveis = operacoesPJ.filter((op) => !ocultas.includes(op.href));

  return (
    <main className="mx-auto w-full px-4 py-16 sm:px-6 lg:w-[70%]">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Simulador de crédito
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        Escolha o tipo de operação para simular parcelas com taxas médias
        reportadas por instituições financeiras ao Banco Central do Brasil.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Para mim
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Crédito para pessoa física.
        </p>
        <div className="mt-4">
          <GridOperacoes operacoes={operacoesPFVisiveis} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Para minha empresa
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Crédito para pessoa jurídica.
        </p>
        <div className="mt-4">
          <GridOperacoes operacoes={operacoesPJVisiveis} />
        </div>
      </section>
    </main>
  );
}
