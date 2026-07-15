import type { Metadata } from "next";
import Link from "next/link";
import { fetchTaxasDiaria } from "@/lib/bcb";
import { formatarData } from "@/lib/formato";
import { SimuladorModalidade } from "@/components/SimuladorModalidade";
import { MODALIDADES } from "@/lib/modalidades";

type TipoConsignado = "inss" | "privado" | "publico";

const TIPOS: Record<
  TipoConsignado,
  {
    label: string;
    modalidade: string;
    tituloMetadata: string;
    descricaoMetadata: string;
    elegibilidade: string;
  }
> = {
  inss: {
    label: "Aposentados e pensionistas (INSS)",
    modalidade: MODALIDADES.consignadoInss.nome,
    tituloMetadata: "Simulador de Consignado INSS — taxas reais do Banco Central",
    descricaoMetadata:
      "Simule o empréstimo consignado para aposentados e pensionistas do INSS com taxas médias reportadas ao Banco Central.",
    elegibilidade:
      "Disponível para quem recebe aposentadoria ou pensão pelo INSS. As parcelas são descontadas direto do benefício mensal, com um limite legal de comprometimento de renda (margem consignável) — por isso é, historicamente, a modalidade com as menores taxas entre todos os tipos de crédito para pessoa física.",
  },
  privado: {
    label: "Empregado (setor privado)",
    modalidade: MODALIDADES.consignadoPrivado.nome,
    tituloMetadata: "Simulador de Consignado Privado — taxas reais do Banco Central",
    descricaoMetadata:
      "Simule o empréstimo consignado para empregados de empresas privadas com taxas médias reportadas ao Banco Central.",
    elegibilidade:
      "Disponível para empregados com carteira assinada (CLT) cuja empresa tenha convênio com a instituição financeira — nem toda empresa oferece a opção. Sem convênio, o desconto em folha não pode ser feito e o crédito consignado privado não fica disponível para esse funcionário.",
  },
  publico: {
    label: "Servidor público",
    modalidade: MODALIDADES.consignadoPublico.nome,
    tituloMetadata: "Simulador de Consignado para Servidor Público — taxas do Banco Central",
    descricaoMetadata:
      "Simule o empréstimo consignado para servidores públicos federais, estaduais ou municipais com taxas médias reportadas ao Banco Central.",
    elegibilidade:
      "Disponível para servidores públicos ativos ou aposentados de órgãos federais, estaduais ou municipais que tenham convênio com a instituição financeira. Por ter estabilidade e menor risco de desemprego que o setor privado, costuma ter taxas um pouco menores que o consignado privado.",
  },
};

function ehTipoValido(valor: string | undefined): valor is TipoConsignado {
  return valor === "inss" || valor === "privado" || valor === "publico";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}): Promise<Metadata> {
  const { tipo: tipoParam } = await searchParams;
  const tipo = ehTipoValido(tipoParam) ? tipoParam : "inss";
  return {
    title: TIPOS[tipo].tituloMetadata,
    description: TIPOS[tipo].descricaoMetadata,
  };
}

export default async function ConsignadoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo: tipoParam } = await searchParams;
  const tipo = ehTipoValido(tipoParam) ? tipoParam : "inss";
  const config = TIPOS[tipo];
  const dados = await fetchTaxasDiaria(config.modalidade);

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TIPOS) as TipoConsignado[]).map((chave) => (
            <Link
              key={chave}
              href={chave === "inss" ? "/consignado" : `/consignado?tipo=${chave}`}
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
        titulo={`Simulador de crédito consignado — ${config.label}`}
        resumo="Simule sua parcela de consignado usando taxas de mercado reportadas ao Banco Central do Brasil."
        periodoLabel={`Taxas referentes ao período de ${formatarData(dados.inicioPeriodo)} a ${formatarData(dados.fimPeriodo)}.`}
        taxas={dados.taxas}
        mediaAoMes={dados.mediaAoMes}
        mediaAoAno={dados.mediaAoAno}
        valorInicial={5000}
        mesesInicial={48}
      >
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Quem pode contratar nesta modalidade
        </h2>
        <p>{config.elegibilidade}</p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Como funciona o crédito consignado
        </h2>
        <p>
          A parcela do consignado é descontada automaticamente na fonte —
          folha de pagamento, benefício do INSS ou contracheque do servidor —
          antes mesmo do valor chegar à sua conta. Isso praticamente elimina o
          risco de inadimplência para o banco, e é o principal motivo das
          taxas serem muito menores que as do crédito pessoal comum. Por lei,
          existe um limite de quanto da sua renda pode ser comprometido com
          descontos consignados (a margem consignável), normalmente em torno
          de 35% do salário ou benefício.
        </p>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dicas antes de contratar
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Consulte sua margem consignável disponível antes de simular um
            valor — pelo aplicativo do INSS (Meu INSS), do seu órgão público
            ou do RH da empresa, dependendo do seu caso.
          </li>
          <li>
            Cuidado com ofertas de refinanciamento ou portabilidade não
            solicitadas por telefone — golpes envolvendo consignado do INSS
            são comuns; sempre confirme a operação pelos canais oficiais.
          </li>
          <li>
            Compare o CET entre instituições diferentes: mesmo dentro do
            consignado, a diferença de taxa entre bancos pode ser relevante,
            como mostra a tabela abaixo.
          </li>
        </ul>
      </SimuladorModalidade>
    </>
  );
}
