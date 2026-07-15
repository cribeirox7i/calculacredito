import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTaxasMensal } from "@/lib/bcb";
import { formatarMesAno } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES_IMOBILIARIO } from "@/lib/modalidades";

type TipoFinanciamento = "regulada" | "mercado";
type Indexador = "prefixado" | "tr" | "ipca";

function ehTipoValido(valor: string): valor is TipoFinanciamento {
  return valor === "regulada" || valor === "mercado";
}

function ehIndexadorValido(valor: string): valor is Indexador {
  return valor === "prefixado" || valor === "tr" || valor === "ipca";
}

const LABEL_TIPO: Record<TipoFinanciamento, string> = {
  regulada: "Taxas reguladas (SFH)",
  mercado: "Taxas de mercado (SFI)",
};

const LABEL_INDEXADOR: Record<Indexador, string> = {
  prefixado: "Prefixado",
  tr: "Pós-fixado (TR)",
  ipca: "Pós-fixado (IPCA)",
};

export function generateStaticParams() {
  const tipos: TipoFinanciamento[] = ["regulada", "mercado"];
  const indexadores: Indexador[] = ["prefixado", "tr", "ipca"];
  return tipos.flatMap((tipo) => indexadores.map((indexador) => ({ tipo, indexador })));
}

type Params = { params: Promise<{ tipo: string; indexador: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tipo, indexador } = await params;
  if (!ehTipoValido(tipo) || !ehIndexadorValido(indexador)) return {};
  return {
    title: `Simulador de Financiamento Imobiliário — ${LABEL_TIPO[tipo]}, ${LABEL_INDEXADOR[indexador]}`,
    description:
      "Simule o financiamento do seu imóvel com taxas médias reportadas ao Banco Central do Brasil. Entenda SFH x SFI, os indexadores TR/IPCA e dicas antes de assinar.",
  };
}

export default async function FinanciamentoImobiliarioPage({ params }: Params) {
  const { tipo, indexador } = await params;
  if (!ehTipoValido(tipo) || !ehIndexadorValido(indexador)) notFound();

  const modalidade = MODALIDADES_IMOBILIARIO[tipo][indexador].nome;
  const dados = await fetchTaxasMensal(modalidade);

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-2 px-4 pt-12 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {(["regulada", "mercado"] as TipoFinanciamento[]).map((chave) => (
            <Link
              key={chave}
              href={`/financiamento-imobiliario/${chave}/${indexador}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                chave === tipo
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {LABEL_TIPO[chave]}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["prefixado", "tr", "ipca"] as Indexador[]).map((chave) => (
            <Link
              key={chave}
              href={`/financiamento-imobiliario/${tipo}/${chave}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                chave === indexador
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {LABEL_INDEXADOR[chave]}
            </Link>
          ))}
        </div>
      </div>

      <SimuladorModalidade
        titulo={`Simulador de financiamento imobiliário — ${LABEL_TIPO[tipo]}`}
        resumo="Simule a parcela do financiamento do seu imóvel usando taxas de mercado reportadas ao Banco Central do Brasil."
        periodoLabel={`Taxas referentes a ${formatarMesAno(dados.anoMes)} — ${LABEL_INDEXADOR[indexador]}.`}
        taxas={dados.taxas}
        mediaAoMes={dados.mediaAoMes}
        mediaAoAno={dados.mediaAoAno}
        valorInicial={300000}
        mesesInicial={360}
        disclaimerExtra="Esta simulação usa a Tabela Price (parcelas fixas); muitos contratos imobiliários usam o Sistema de Amortização Constante (SAC), que tem parcelas decrescentes e CET final diferente — confirme qual sistema consta na sua proposta."
      >
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Taxas reguladas (SFH) x taxas de mercado (SFI)
        </h2>
        <p>
          O Sistema Financeiro da Habitação (SFH) financia imóveis até um teto
          de valor definido pelo Conselho Monetário Nacional, permite o uso do
          saldo do FGTS e tem taxas de juros limitadas por regulação — por
          isso costuma ter as menores taxas do mercado. Acima desse teto de
          valor, ou fora das regras do SFH, o financiamento passa a ser feito
          pelo Sistema de Financiamento Imobiliário (SFI), com taxas de
          mercado livremente pactuadas entre banco e cliente, normalmente mais
          altas.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que muda entre prefixado, TR e IPCA
        </h2>
        <p>
          No <strong>prefixado</strong>, a taxa de juros é fixa do início ao
          fim do contrato — previsível, mas geralmente com a taxa nominal mais
          alta para compensar o banco pelo risco de inflação futura. No{" "}
          <strong>pós-fixado referenciado em TR</strong>, a parcela é corrigida
          pela Taxa Referencial, historicamente próxima de zero nos últimos
          anos. No <strong>pós-fixado referenciado em IPCA</strong>, o saldo
          devedor é corrigido pela inflação oficial — a parcela tende a subir
          com o tempo, mas a taxa de juros contratada costuma ser menor.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Price x SAC
        </h2>
        <p>
          Esta simulação usa a Tabela Price, com parcelas fixas do início ao
          fim. Mas boa parte dos contratos de financiamento imobiliário no
          Brasil usa o SAC (Sistema de Amortização Constante), em que a
          amortização é fixa e os juros diminuem a cada parcela — a parcela
          começa mais alta e vai caindo ao longo do contrato, e o total pago
          em juros costuma ser menor que no Price. Sempre confirme com o
          banco qual sistema de amortização está na sua proposta antes de
          comparar valores.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de contratar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Verifique se seu imóvel e sua renda se enquadram no teto do SFH
            antes de assumir que só o SFI está disponível — as taxas
            reguladas costumam compensar bastante.
          </li>
          <li>
            Considere usar o saldo do FGTS para reduzir o valor financiado ou
            amortizar parcelas, quando elegível.
          </li>
          <li>
            Compare o CET entre bancos diferentes e entre indexadores — um
            IPCA com taxa nominal menor pode custar mais no total se a
            inflação acumulada for alta ao longo do contrato.
          </li>
          <li>
            Lembre que o financiamento imobiliário costuma incluir seguros
            obrigatórios (MIP e DFI), que entram no CET e no valor da
            parcela.
          </li>
        </ul>
      </SimuladorModalidade>
    </>
  );
}
