import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES_PJ } from "@/lib/modalidades";

type Indexador = "prefixado" | "posfixado";

function ehIndexadorValido(valor: string): valor is Indexador {
  return valor === "prefixado" || valor === "posfixado";
}

const LABEL_INDEXADOR: Record<Indexador, string> = {
  prefixado: "Prefixado",
  posfixado: "Pós-fixado (juros flutuantes)",
};

export function generateStaticParams() {
  return (["prefixado", "posfixado"] as Indexador[]).map((indexador) => ({ indexador }));
}

type Params = { params: Promise<{ indexador: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { indexador } = await params;
  if (!ehIndexadorValido(indexador)) return {};
  return {
    title: `Simulador de Capital de Giro - ${LABEL_INDEXADOR[indexador]}`,
    description:
      "Simule capital de giro para sua empresa com taxas médias reportadas ao Banco Central do Brasil.",
  };
}

export default async function CapitalGiroPage({ params }: Params) {
  const { indexador } = await params;
  if (!ehIndexadorValido(indexador)) notFound();

  const [dadosCurto, dadosLongo] = await Promise.all([
    fetchTaxasDiaria(MODALIDADES_PJ.capitalGiro.curto[indexador].nome),
    fetchTaxasDiaria(MODALIDADES_PJ.capitalGiro.longo[indexador].nome),
  ]);

  return (
    <>
      <div className="mx-auto w-full px-4 pt-12 sm:px-6 lg:w-[70%]">
        <div className="flex flex-wrap gap-2">
          {(["prefixado", "posfixado"] as Indexador[]).map((chave) => (
            <Link
              key={chave}
              href={`/capital-giro/${chave}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                chave === indexador
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {LABEL_INDEXADOR[chave]}
            </Link>
          ))}
        </div>
      </div>

      <SimuladorModalidade
        titulo="Simulador de capital de giro"
        resumo="Simule a parcela do capital de giro da sua empresa usando taxas de mercado reportadas ao Banco Central do Brasil."
        periodoLabel={`Taxas referentes ao período de ${formatarData(dadosCurto.inicioPeriodo)} a ${formatarData(dadosCurto.fimPeriodo)}.`}
        taxas={dadosCurto.taxas}
        mediaAoMes={dadosCurto.mediaAoMes}
        mediaAoAno={dadosCurto.mediaAoAno}
        valorInicial={50000}
        mesesInicial={12}
        gruposPorPrazo={{
          limiteMeses: 12,
          labelCurto: "prazo até 365 dias",
          labelLongo: "prazo superior a 365 dias",
          curto: {
            taxas: dadosCurto.taxas,
            taxaMediaAoMes: dadosCurto.mediaAoMes,
            mediaAoAno: dadosCurto.mediaAoAno,
          },
          longo: {
            taxas: dadosLongo.taxas,
            taxaMediaAoMes: dadosLongo.mediaAoMes,
            mediaAoAno: dadosLongo.mediaAoAno,
          },
        }}
        disclaimerExtra="Linha de crédito voltada a pessoas jurídicas - não confundir com as modalidades de crédito para pessoa física. A tabela abaixo troca automaticamente entre as taxas de até 365 dias e acima de 365 dias conforme o prazo (meses) preenchido na calculadora."
      >
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é capital de giro
        </h2>
        <p>
          Capital de giro é o crédito que financia as operações do dia a dia
          da empresa - compra de estoque, pagamento de fornecedores, folha de
          pagamento - sem estar atrelado a um investimento específico. É a
          modalidade de crédito PJ mais comum para cobrir descasamentos entre
          o que a empresa recebe e o que precisa pagar no curto prazo.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Prazo até 365 dias x superior a 365 dias
        </h2>
        <p>
          Capital de giro de curto prazo (até 365 dias) costuma ter taxas
          menores e é indicado para necessidades pontuais e sazonais. O de
          longo prazo (acima de 365 dias) financia necessidades mais
          estruturais de caixa, com parcelas menores mas custo total maior
          por causa do prazo estendido. A tabela abaixo já mostra
          automaticamente as taxas certas para o prazo que você preencher na
          calculadora.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Prefixado x pós-fixado
        </h2>
        <p>
          No <strong>prefixado</strong>, a taxa de juros é fixa durante todo o
          contrato. No <strong>pós-fixado referenciado em juros flutuantes</strong>,
          a taxa acompanha um indexador de mercado (como o CDI) - a parcela
          pode variar com o tempo conforme esse indexador sobe ou desce.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de contratar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Compare o CET entre bancos diferentes - a diferença de taxa entre
            instituições costuma ser grande em crédito PJ.
          </li>
          <li>
            Avalie se a necessidade é pontual (curto prazo) ou estrutural
            (longo prazo) antes de escolher - contratar prazo maior que o
            necessário aumenta o custo total em juros.
          </li>
          <li>
            Se a taxa for pós-fixada, simule cenários com o indexador subindo
            para não ser surpreendido por parcelas mais altas no futuro.
          </li>
        </ul>
      </SimuladorModalidade>
    </>
  );
}
