import type { Metadata } from "next";
import { obterTaxasMaquininha } from "@/lib/taxas-maquininha";
import { SimuladorMaquininha } from "@/components/SimuladorMaquininha";

export const metadata: Metadata = {
  title: "Simulador de Taxa de Maquininha - compare adquirentes",
  description:
    "Compare as taxas de débito, crédito à vista e crédito parcelado das principais maquininhas de cartão e veja quanto você recebe líquido em cada venda.",
};

export default async function MaquininhaDeCartaoPage() {
  const taxas = await obterTaxasMaquininha();

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Simulador de taxa de maquininha
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Compare quanto cada adquirente desconta por venda e quanto você recebe
        líquido, por forma de pagamento e número de parcelas.
      </p>

      <div className="mt-8">
        <SimuladorMaquininha taxas={taxas} />
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Este site não é uma instituição financeira nem uma adquirente, não
        processa pagamentos e não coleta dados pessoais. As taxas mostradas
        são anunciadas publicamente pelas próprias operadoras de maquininha e
        cadastradas manualmente neste site - não são uma média oficial de
        mercado (diferente das simulações de crédito deste site, que usam
        dados do Banco Central). A taxa real da sua conta depende do seu
        faturamento e da negociação com a adquirente.
      </p>

      <section className="mt-12 space-y-4 text-zinc-700 dark:text-zinc-300">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é a taxa da maquininha (MDR)
        </h2>
        <p>
          Toda vez que você recebe uma venda no cartão, a adquirente (a
          empresa dona da maquininha, como Cielo, Stone ou InfinitePay)
          desconta um percentual do valor antes de repassar o dinheiro pra sua
          conta. Esse percentual é chamado de MDR (Merchant Discount Rate,
          taxa de desconto do lojista) e varia conforme a forma de pagamento:
          Pix costuma ser o mais barato (às vezes gratuito), débito vem em
          seguida, crédito à vista custa mais que débito, e crédito parcelado
          é o mais caro - a taxa sobe quanto mais parcelas o cliente escolhe,
          porque a adquirente está adiantando esse dinheiro pra você.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Por que a taxa parcelada sobe a cada parcela
        </h2>
        <p>
          Quando o cliente parcela a compra, a adquirente paga o lojista antes
          de receber do cliente - é basicamente um adiantamento. Quanto mais
          parcelas, mais tempo esse dinheiro fica adiantado, e maior o custo
          embutido na taxa. Por isso vale comparar não só a taxa de crédito à
          vista, mas a taxa específica pro número de parcelas que seus
          clientes mais usam.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Antecipação de recebíveis
        </h2>
        <p>
          Além da taxa por venda, muitas adquirentes cobram (ou embutem numa
          taxa maior) para antecipar o recebimento - em vez de esperar o prazo
          padrão (geralmente 30 dias no crédito), você recebe em 1 dia útil ou
          até na hora. Isso tem um custo, seja como uma taxa separada de
          antecipação, seja como uma taxa de venda já mais alta no plano
          &ldquo;recebe rápido&rdquo;. Vale simular os dois cenários antes de
          escolher o plano.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que olhar antes de trocar de maquininha
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Taxa anunciada x taxa negociada</strong>: as taxas públicas
            das adquirentes são só um ponto de partida - quem aceita a
            primeira proposta costuma pagar mais do que quem negocia,
            principalmente em faturamentos mais altos.
          </li>
          <li>
            <strong>Aluguel x compra da maquininha</strong>: alguns planos têm
            mensalidade de aluguel do equipamento com taxa menor; outros
            vendem a maquininha (sem mensalidade) com taxa maior - o que
            compensa depende do seu volume mensal de vendas.
          </li>
          <li>
            <strong>Prazo de recebimento</strong>: compare sempre o mesmo prazo
            de recebimento entre adquirentes (por exemplo, D+30 com D+30) - taxas
            de planos com recebimento na hora não são comparáveis com taxas de
            planos de recebimento padrão.
          </li>
          <li>
            <strong>Bandeiras aceitas</strong>: nem toda maquininha cobra a
            mesma taxa pra todas as bandeiras - Elo e Amex costumam ter taxa
            mais alta que Visa e Mastercard em vários planos.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sobre os dados deste comparador
        </h2>
        <p>
          Diferente das simulações de crédito deste site (que usam a API de
          taxas de juros do Banco Central, atualizada automaticamente), não
          existe uma fonte oficial única com a taxa média de mercado das
          maquininhas de cartão - cada adquirente negocia individualmente com
          cada cliente. As taxas mostradas aqui são coletadas manualmente das
          páginas públicas de cada operadora e podem estar desatualizadas;
          use o link no nome do adquirente pra conferir a fonte original antes
          de decidir.
        </p>
      </section>
    </main>
  );
}
