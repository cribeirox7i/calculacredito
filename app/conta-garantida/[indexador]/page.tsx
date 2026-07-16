import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTaxaCDI, fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES_PJ } from "@/lib/modalidades";

type Indexador = "prefixado" | "posfixado";

const LABEL: Record<Indexador, string> = {
  prefixado: "Prefixado",
  posfixado: "Pós-fixado (juros flutuantes)",
};

function ehIndexadorValido(valor: string): valor is Indexador {
  return valor === "prefixado" || valor === "posfixado";
}

export function generateStaticParams() {
  return (["prefixado", "posfixado"] as Indexador[]).map((indexador) => ({ indexador }));
}

type Params = { params: Promise<{ indexador: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { indexador } = await params;
  if (!ehIndexadorValido(indexador)) return {};
  return {
    title: `Simulador de Conta Garantida - ${LABEL[indexador]}`,
    description:
      "Simule a conta garantida da sua empresa com taxas médias reportadas ao Banco Central do Brasil.",
  };
}

export default async function ContaGarantidaPage({ params }: Params) {
  const { indexador } = await params;
  if (!ehIndexadorValido(indexador)) notFound();

  const modalidade = MODALIDADES_PJ.contaGarantida[indexador].nome;
  const [dados, cdi] = await Promise.all([
    fetchTaxasDiaria(modalidade),
    indexador === "posfixado" ? fetchTaxaCDI() : Promise.resolve(null),
  ]);

  return (
    <>
      <div className="mx-auto w-full px-4 pt-12 sm:px-6 lg:w-[70%]">
        <div className="flex flex-wrap gap-2">
          {(["prefixado", "posfixado"] as Indexador[]).map((chave) => (
            <Link
              key={chave}
              href={`/conta-garantida/${chave}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                chave === indexador
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {LABEL[chave]}
            </Link>
          ))}
        </div>
      </div>

      <SimuladorModalidade
        titulo="Simulador de conta garantida"
        resumo="Simule a conta garantida da sua empresa usando taxas de mercado reportadas ao Banco Central do Brasil."
        periodoLabel={`Taxas referentes ao período de ${formatarData(dados.inicioPeriodo)} a ${formatarData(dados.fimPeriodo)}.`}
        taxas={dados.taxas}
        mediaAoMes={dados.mediaAoMes}
        mediaAoAno={dados.mediaAoAno}
        valorInicial={20000}
        mesesInicial={6}
        indexadorPosFixado={cdi !== null ? { nome: "CDI", taxaAnual: cdi } : undefined}
        disclaimerExtra="Linha de crédito voltada a pessoas jurídicas - não confundir com as modalidades de crédito para pessoa física."
      >
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          O que é conta garantida
        </h2>
        <p>
          Conta garantida é um limite de crédito rotativo vinculado à conta
          corrente da empresa - quando o saldo fica negativo dentro do
          limite, os juros dessa modalidade são cobrados automaticamente
          sobre o valor utilizado, sem precisar de uma nova contratação a
          cada uso.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Conta garantida x capital de giro
        </h2>
        <p>
          A conta garantida é pensada para cobrir necessidades pontuais e de
          curtíssimo prazo (dias), com taxas geralmente mais altas por ser um
          crédito instantâneo e sem burocracia. Já o capital de giro é
          contratado com prazo e parcelas definidas, normalmente com taxas
          menores - vale usar a conta garantida como reserva emergencial, não
          como fonte principal de crédito da empresa.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de contratar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Use a conta garantida só para cobrir descasamentos de caixa
            pontuais - o custo de ficar utilizando o limite por muito tempo
            costuma ser alto.
          </li>
          <li>
            Compare o CET entre bancos diferentes antes de definir onde
            manter essa linha.
          </li>
          <li>
            Se a necessidade de crédito for recorrente e previsível, avalie
            migrar para uma linha de capital de giro com taxa menor.
          </li>
        </ul>
      </SimuladorModalidade>
    </>
  );
}
