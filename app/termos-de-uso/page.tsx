import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do CalculaCredito - leia antes de usar as simulações de crédito do site.",
};

export default function TermosDeUsoPage() {
  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Termos de Uso</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Última atualização: julho de 2026.</p>

      <section className="mt-8 space-y-4 text-zinc-700 dark:text-zinc-300">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">1. O que é o CalculaCredito</h2>
        <p>
          O CalculaCredito é um site de simulação de crédito para pessoas
          físicas e empresas, e de comparação de taxas de maquininha de
          cartão. Ao usar o site, você concorda com estes termos.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">2. O site não é uma instituição financeira</h2>
        <p>
          Não somos um banco, financeira, correspondente bancário ou
          adquirente de meios de pagamento. Não oferecemos crédito, não
          processamos transações e não temos vínculo comercial com as
          instituições listadas nas nossas tabelas. Os valores exibidos são
          simulações estimativas, não uma proposta ou oferta de crédito.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">3. Fonte e precisão dos dados</h2>
        <p>
          As simulações de crédito pessoal, consignado, financiamento de
          veículo, financiamento imobiliário, capital de giro, conta
          garantida, cheque especial PJ e desconto de duplicatas usam taxas
          de juros reportadas por instituições financeiras ao Banco Central
          do Brasil (Portal de Dados Abertos), atualizadas periodicamente.
        </p>
        <p>
          As taxas de maquininha de cartão não têm uma fonte oficial
          equivalente - são coletadas manualmente das páginas públicas de
          cada adquirente e podem estar desatualizadas ou divergir do que é
          efetivamente negociado com cada cliente. Em nenhum dos dois casos
          garantimos que os valores exibidos refletem exatamente a taxa que
          você vai conseguir contratar - eles servem como ponto de partida
          para pesquisa, não como cotação final.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">4. Não é aconselhamento financeiro</h2>
        <p>
          O conteúdo do site tem finalidade informativa e educacional. Não
          constitui aconselhamento financeiro, de crédito ou de investimento.
          Antes de contratar qualquer operação, consulte as condições reais
          oferecidas pela instituição financeira, incluindo o Custo Efetivo
          Total (CET).
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">5. Dados pessoais</h2>
        <p>
          As simulações são calculadas inteiramente no seu navegador, a
          partir dos valores que você digita - nenhum dado pessoal ou de
          simulação é armazenado ou enviado para nossos servidores.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">6. Links externos</h2>
        <p>
          O site pode conter links para sites de terceiros (instituições
          financeiras, adquirentes de maquininha). Não somos responsáveis
          pelo conteúdo, disponibilidade ou práticas desses sites.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">7. Publicidade</h2>
        <p>
          O site pode exibir anúncios de terceiros (Google AdSense) para
          manter a operação gratuita. A exibição de um anúncio não
          representa endosso ou recomendação do produto anunciado.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">8. Alterações destes termos</h2>
        <p>
          Podemos atualizar estes termos periodicamente. A data no topo desta
          página indica a última revisão.
        </p>
      </section>
    </main>
  );
}
