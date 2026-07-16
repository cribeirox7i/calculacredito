import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES_PJ } from "@/lib/modalidades";

type Prazo = "curto" | "longo";
type Indexador = "prefixado" | "posfixado";

function ehPrazoValido(valor: string): valor is Prazo {
  return valor === "curto" || valor === "longo";
}

function ehIndexadorValido(valor: string): valor is Indexador {
  return valor === "prefixado" || valor === "posfixado";
}

const LABEL_PRAZO: Record<Prazo, string> = {
  curto: "Até 365 dias",
  longo: "Superior a 365 dias",
};

const LABEL_INDEXADOR: Record<Indexador, string> = {
  prefixado: "Prefixado",
  posfixado: "Pós-fixado (juros flutuantes)",
};

const VALOR_INICIAL: Record<Prazo, number> = { curto: 30000, longo: 100000 };
const MESES_INICIAL: Record<Prazo, number> = { curto: 12, longo: 36 };

export function generateStaticParams() {
  const prazos: Prazo[] = ["curto", "longo"];
  const indexadores: Indexador[] = ["prefixado", "posfixado"];
  return prazos.flatMap((prazo) => indexadores.map((indexador) => ({ prazo, indexador })));
}

type Params = { params: Promise<{ prazo: string; indexador: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { prazo, indexador } = await params;
  if (!ehPrazoValido(prazo) || !ehIndexadorValido(indexador)) return {};
  return {
    title: `Simulador de Capital de Giro — ${LABEL_PRAZO[prazo]}, ${LABEL_INDEXADOR[indexador]}`,
    description:
      "Simule capital de giro para sua empresa com taxas médias reportadas ao Banco Central do Brasil.",
  };
}

export default async function CapitalGiroPage({ params }: Params) {
  const { prazo, indexador } = await params;
  if (!ehPrazoValido(prazo) || !ehIndexadorValido(indexador)) notFound();

  const modalidade = MODALIDADES_PJ.capitalGiro[prazo][indexador].nome;
  const dados = await fetchTaxasDiaria(modalidade);

  return (
    <>
      <div className="mx-auto w-full space-y-2 px-4 pt-12 sm:px-6 lg:w-[70%]">
        <div className="flex flex-wrap gap-2">
          {(["curto", "longo"] as Prazo[]).map((chave) => (
            <Link
              key={chave}
              href={`/capital-giro/${chave}/${indexador}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                chave === prazo
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {LABEL_PRAZO[chave]}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["prefixado", "posfixado"] as Indexador[]).map((chave) => (
            <Link
              key={chave}
              href={`/capital-giro/${prazo}/${chave}`}
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
        titulo={`Simulador de capital de giro — ${LABEL_PRAZO[prazo]}`}
        resumo="Simule a parcela do capital de giro da sua empresa usando taxas de mercado reportadas ao Banco Central do Brasil."
        periodoLabel={`Taxas referentes ao período de ${formatarData(dados.inicioPeriodo)} a ${formatarData(dados.fimPeriodo)}.`}
        taxas={dados.taxas}
        mediaAoMes={dados.mediaAoMes}
        mediaAoAno={dados.mediaAoAno}
        valorInicial={VALOR_INICIAL[prazo]}
        mesesInicial={MESES_INICIAL[prazo]}
        disclaimerExtra="Linha de crédito voltada a pessoas jurídicas — não confundir com as modalidades de crédito para pessoa física."
      >
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é capital de giro
        </h2>
        <p>
          Capital de giro é o crédito que financia as operações do dia a dia
          da empresa — compra de estoque, pagamento de fornecedores, folha de
          pagamento — sem estar atrelado a um investimento específico. É a
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
          por causa do prazo estendido.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Prefixado x pós-fixado
        </h2>
        <p>
          No <strong>prefixado</strong>, a taxa de juros é fixa durante todo o
          contrato. No <strong>pós-fixado referenciado em juros flutuantes</strong>,
          a taxa acompanha um indexador de mercado (como o CDI) — a parcela
          pode variar com o tempo conforme esse indexador sobe ou desce.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de contratar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Compare o CET entre bancos diferentes — a diferença de taxa entre
            instituições costuma ser grande em crédito PJ.
          </li>
          <li>
            Avalie se a necessidade é pontual (curto prazo) ou estrutural
            (longo prazo) antes de escolher — contratar prazo maior que o
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
