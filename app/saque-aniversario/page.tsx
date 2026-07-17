import type { Metadata } from "next";
import { SimuladorSaqueAniversario } from "@/components/SimuladorSaqueAniversario";

export const metadata: Metadata = {
  title: "Calculadora de Saque-Aniversário do FGTS",
  description:
    "Calcule quanto você pode sacar do saque-aniversário do FGTS de acordo com a tabela oficial de alíquotas por faixa de saldo.",
};

export default function SaqueAniversarioPage() {
  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Calculadora de saque-aniversário do FGTS
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Informe o saldo total do seu FGTS e veja quanto você pode sacar todo
        ano no mês do seu aniversário, de acordo com a tabela oficial de
        alíquotas.
      </p>

      <div className="mt-8">
        <SimuladorSaqueAniversario />
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Este site não é a Caixa Econômica Federal nem representa o FGTS, não
        movimenta valores e não coleta dados pessoais. O cálculo segue a
        tabela oficial de alíquotas por faixa de saldo - confirme sempre o
        valor exato disponível para saque no aplicativo FGTS antes de tomar
        qualquer decisão.
      </p>

      <section className="mt-12 space-y-4 text-zinc-700 dark:text-zinc-300">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é o saque-aniversário
        </h2>
        <p>
          O saque-aniversário é uma modalidade opcional de movimentação do
          FGTS que permite sacar uma parte do saldo, uma vez por ano, no mês
          do seu aniversário - em vez de esperar por uma demissão sem justa
          causa para movimentar o fundo. O percentual liberado depende de uma
          tabela de alíquotas: quanto maior o saldo acumulado, menor o
          percentual sacável, mas o valor em reais tende a ser maior por causa
          da parcela adicional fixa somada à alíquota.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Saque-aniversário x saque-rescisão
        </h2>
        <p>
          Na modalidade padrão (saque-rescisão), o trabalhador só pode sacar o
          saldo total do FGTS em situações específicas, principalmente a
          demissão sem justa causa - quando também recebe a multa rescisória
          de 40% sobre o saldo. Ao optar pelo saque-aniversário, você abre mão
          do direito de sacar o saldo total na demissão: recebe apenas a
          multa de 40% na conta, e o saldo do fundo continua rendendo e só
          pode ser movimentado nos períodos de aniversário (ou nas demais
          hipóteses legais de saque, como aposentadoria, compra de imóvel
          pelo SFH ou doenças graves, que continuam valendo nas duas
          modalidades).
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Como aderir e como desistir
        </h2>
        <p>
          A adesão é feita pelo aplicativo FGTS e vale para todas as contas
          vinculadas do trabalhador, não apenas o emprego atual. Depois de
          aderir, é possível pedir o cancelamento a qualquer momento, também
          pelo aplicativo - mas o retorno à modalidade padrão (saque-rescisão)
          só produz efeito depois de um prazo de carência de dois anos
          contados da data de adesão, período em que você permanece sujeito
          às regras do saque-aniversário.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Quando o dinheiro cai na conta
        </h2>
        <p>
          O valor fica disponível para saque a partir do primeiro dia útil do
          mês de aniversário do trabalhador e pode ser sacado dentro de um
          prazo de alguns meses (a janela é informada no próprio aplicativo
          FGTS) - depois desse prazo, o direito ao saque daquele ano expira e
          o valor volta a integrar o saldo normalmente.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de aderir
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Avalie a chance real de ser demitido sem justa causa nos próximos
            anos - quem tem alta probabilidade de demissão costuma sair
            perdendo ao abrir mão do saque do saldo total.
          </li>
          <li>
            Lembre que a adesão vale para todas as contas do FGTS e que o
            cancelamento tem carência de dois anos - não é uma decisão
            reversível de um mês para o outro.
          </li>
          <li>
            Simule o valor de alguns anos seguidos: como a parcela adicional
            é fixa e a alíquota cai por faixa, o percentual sacável tende a
            diminuir conforme o saldo cresce.
          </li>
          <li>
            Bancos oferecem antecipar esses saques futuros mediante uma taxa
            de deságio - antes de contratar, compare sempre o valor líquido
            recebido hoje com a soma dos valores que você sacaria ano a ano
            sem antecipar.
          </li>
        </ul>
      </section>
    </main>
  );
}
