import Link from "next/link";

type Operacao = {
  titulo: string;
  descricao: string;
  href?: string;
};

const operacoes: Operacao[] = [
  {
    titulo: "Crédito pessoal",
    descricao: "Empréstimo sem destinação específica, sem garantia ou desconto em folha.",
    href: "/credito-pessoal",
  },
  {
    titulo: "Crédito consignado",
    descricao: "Parcelas descontadas direto da folha de pagamento, benefício ou aposentadoria.",
    href: "/consignado",
  },
  {
    titulo: "Financiamento de veículo",
    descricao: "Aquisição de veículo com o próprio bem como garantia.",
    href: "/financiamento-veiculo",
  },
  {
    titulo: "Financiamento imobiliário",
    descricao: "Compra de imóvel com taxas de mercado ou reguladas (SFH/SFI).",
    href: "/financiamento-imobiliario",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Simulador de crédito
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        Escolha o tipo de operação para simular parcelas com taxas médias
        reportadas por instituições financeiras ao Banco Central do Brasil.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {operacoes.map((op) => {
          const conteudo = (
            <div
              className={`h-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900 ${
                op.href ? "hover:border-zinc-400 dark:hover:border-zinc-600" : "opacity-60"
              }`}
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {op.titulo}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{op.descricao}</p>
              {!op.href && (
                <span className="mt-3 inline-block text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Em breve
                </span>
              )}
            </div>
          );

          return op.href ? (
            <Link key={op.titulo} href={op.href}>
              {conteudo}
            </Link>
          ) : (
            <div key={op.titulo}>{conteudo}</div>
          );
        })}
      </div>
    </main>
  );
}
