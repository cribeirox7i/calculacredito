import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES_CARTAO } from "@/lib/modalidades";

type TipoCartao = "rotativo" | "parcelado";

const TIPOS: Record<
  TipoCartao,
  {
    label: string;
    modalidade: string;
    tituloMetadata: string;
    descricaoMetadata: string;
    explicacao: string;
  }
> = {
  rotativo: {
    label: "Rotativo (fatura paga parcialmente)",
    modalidade: MODALIDADES_CARTAO.rotativo.nome,
    tituloMetadata: "Simulador de Juros do Rotativo do Cartão - taxas reais do Banco Central",
    descricaoMetadata:
      "Veja quanto cada instituição cobra de juros no rotativo do cartão de crédito, com taxas médias reportadas ao Banco Central.",
    explicacao:
      "O rotativo é acionado automaticamente quando você paga só uma parte da fatura (o mínimo ou qualquer valor abaixo do total) até a data de vencimento. O saldo que ficou em aberto passa a render juros a partir do dia seguinte - e é historicamente a modalidade de crédito mais cara do país, muito acima do crédito pessoal comum.",
  },
  parcelado: {
    label: "Parcelamento da fatura",
    modalidade: MODALIDADES_CARTAO.parcelado.nome,
    tituloMetadata: "Simulador de Juros do Parcelamento de Fatura - taxas reais do Banco Central",
    descricaoMetadata:
      "Veja quanto cada instituição cobra de juros ao parcelar a fatura do cartão de crédito, com taxas médias reportadas ao Banco Central.",
    explicacao:
      "O parcelamento de fatura é uma opção que o próprio banco oferece quando você não consegue pagar o total: em vez de cair no rotativo, o saldo em aberto vira um número fixo de parcelas mensais com juros. A taxa costuma ser menor que a do rotativo, mas ainda bem mais alta que a do crédito pessoal - por isso o rotativo só deveria ser usado como uma ponte de poucos dias até o parcelamento ou outro empréstimo mais barato.",
  },
};

function ehTipoValido(valor: string): valor is TipoCartao {
  return valor === "rotativo" || valor === "parcelado";
}

export function generateStaticParams() {
  return (Object.keys(TIPOS) as TipoCartao[]).map((tipo) => ({ tipo }));
}

type Params = { params: Promise<{ tipo: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tipo } = await params;
  if (!ehTipoValido(tipo)) return {};
  return {
    title: TIPOS[tipo].tituloMetadata,
    description: TIPOS[tipo].descricaoMetadata,
  };
}

export default async function CartaoCreditoPage({ params }: Params) {
  const { tipo } = await params;
  if (!ehTipoValido(tipo)) notFound();

  const config = TIPOS[tipo];
  const dados = await fetchTaxasDiaria(config.modalidade);

  return (
    <>
      <div className="mx-auto w-full px-4 pt-12 sm:px-6 lg:w-[70%]">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TIPOS) as TipoCartao[]).map((chave) => (
            <Link
              key={chave}
              href={`/cartao-credito/${chave}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                chave === tipo
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {TIPOS[chave].label}
            </Link>
          ))}
        </div>
      </div>

      <SimuladorModalidade
        titulo={`Simulador de juros do cartão de crédito - ${config.label}`}
        resumo="Simule o custo do saldo em aberto do cartão de crédito usando taxas de mercado reportadas ao Banco Central do Brasil."
        periodoLabel={`Taxas referentes ao período de ${formatarData(dados.inicioPeriodo)} a ${formatarData(dados.fimPeriodo)}.`}
        taxas={dados.taxas}
        mediaAoMes={dados.mediaAoMes}
        mediaAoAno={dados.mediaAoAno}
        valorInicial={1500}
        mesesInicial={6}
        tipoIof="pessoaFisica"
      >
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Como funciona {tipo === "rotativo" ? "o rotativo" : "o parcelamento de fatura"}
        </h2>
        <p>{config.explicacao}</p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Rotativo x parcelamento: qual é mais barato
        </h2>
        <p>
          Nos dois casos você está pagando juros sobre um saldo que não coube
          no seu orçamento - a diferença é que o rotativo tem prazo indefinido
          (o saldo continua rendendo juros até você quitar) enquanto o
          parcelamento fixa o número de parcelas e o valor de cada uma desde o
          início. Compare as taxas médias das duas modalidades neste site antes
          de decidir: em geral, sair do rotativo pro parcelamento (ou pra um
          crédito pessoal com taxa ainda menor) reduz bastante o custo total.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de entrar no rotativo ou parcelar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Pague o quanto conseguir da fatura, mesmo que não seja o valor
            total - os juros incidem só sobre o saldo que ficou em aberto, não
            sobre a fatura inteira.
          </li>
          <li>
            Antes de aceitar o parcelamento automático do banco, compare a
            taxa oferecida com a de um crédito pessoal ou consignado - às
            vezes sai mais barato quitar o cartão com outro tipo de
            empréstimo.
          </li>
          <li>
            Evite ficar mais de um mês no rotativo: por lei, os bancos são
            obrigados a oferecer o parcelamento da fatura depois do primeiro
            ciclo, justamente porque o rotativo prolongado é a forma mais cara
            de crédito disponível no mercado.
          </li>
        </ul>
      </SimuladorModalidade>
    </>
  );
}
