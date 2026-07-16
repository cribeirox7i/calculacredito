import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quem somos",
  description: "Conheça o CalculaCredito - simulador independente de crédito com dados públicos do Banco Central.",
};

export default function QuemSomosPage() {
  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Quem somos</h1>

      <section className="mt-8 space-y-4 text-zinc-700 dark:text-zinc-300">
        <p>
          O CalculaCredito é um site independente de simulação de crédito para
          pessoas físicas e empresas. Nosso objetivo é ajudar quem está
          pesquisando uma operação de crédito a entender, antes de conversar
          com um banco, quanto costuma custar cada modalidade - crédito
          pessoal, consignado, financiamento de veículo e imobiliário, capital
          de giro, conta garantida, cheque especial PJ, desconto de
          duplicatas e taxas de maquininha de cartão.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">De onde vêm os dados</h2>
        <p>
          As simulações de crédito usam as taxas de juros reportadas por
          instituições financeiras ao Banco Central do Brasil, através do
          Portal de Dados Abertos - a mesma fonte que qualquer pessoa pode
          consultar publicamente. Já as taxas de maquininha de cartão não têm
          uma fonte oficial equivalente (cada adquirente negocia
          individualmente com cada cliente), então são coletadas manualmente
          das páginas públicas de cada operadora e atualizadas periodicamente.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">O que não somos</h2>
        <p>
          Não somos um banco, uma financeira, uma correspondente bancária nem
          uma adquirente de maquininha - não emprestamos dinheiro, não
          processamos pagamentos e não temos qualquer relação comercial com as
          instituições comparadas nas nossas tabelas. As simulações são
          estimativas educativas baseadas em taxas médias de mercado, não uma
          oferta de crédito.
        </p>

        <p>
          Dúvidas, sugestões ou correções sobre algum dado publicado? Veja os
          nossos{" "}
          <a href="/termos-de-uso" className="underline">
            Termos de Uso
          </a>{" "}
          para mais detalhes sobre como o site funciona.
        </p>
      </section>
    </main>
  );
}
