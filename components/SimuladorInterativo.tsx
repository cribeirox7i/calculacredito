"use client";

import { useMemo, useState } from "react";
import type { TaxaInstituicao } from "@/lib/bcb";
import { simularPrice, type SimulacaoPrice } from "@/lib/amortizacao";
import { corAvatar, iniciaisInstituicao, removerAcentos } from "@/lib/logos";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarNumero(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const LIMITE_PADRAO = 20;

type Coluna =
  | "posicao"
  | "instituicao"
  | "taxaAoMes"
  | "taxaAoAno"
  | "parcela"
  | "totalPago"
  | "totalJuros";

type LinhaTabela = TaxaInstituicao & { simulacao: SimulacaoPrice | null };

const COLUNAS: { chave: Coluna; label: string; alinhamento: "left" | "right" }[] = [
  { chave: "posicao", label: "#", alinhamento: "right" },
  { chave: "instituicao", label: "Instituição", alinhamento: "left" },
  { chave: "taxaAoMes", label: "% ao mês", alinhamento: "right" },
  { chave: "taxaAoAno", label: "% ao ano", alinhamento: "right" },
  { chave: "parcela", label: "Parcela (R$)", alinhamento: "right" },
  { chave: "totalPago", label: "Total pago (R$)", alinhamento: "right" },
  { chave: "totalJuros", label: "Total juros (R$)", alinhamento: "right" },
];

function valorOrdenavel(linha: LinhaTabela, coluna: Coluna): string | number {
  switch (coluna) {
    case "instituicao":
      return linha.instituicao;
    case "parcela":
      return linha.simulacao?.parcela ?? -1;
    case "totalPago":
      return linha.simulacao?.totalPago ?? -1;
    case "totalJuros":
      return linha.simulacao?.totalJuros ?? -1;
    default:
      return linha[coluna];
  }
}

export function SimuladorInterativo({
  taxas,
  taxaMediaAoMes,
  mediaAoAno,
  valorInicial = 5000,
  mesesInicial = 24,
  logosPorCnpj8 = {},
}: {
  taxas: TaxaInstituicao[];
  taxaMediaAoMes: number;
  mediaAoAno: number;
  valorInicial?: number;
  mesesInicial?: number;
  logosPorCnpj8?: Record<string, string>;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [meses, setMeses] = useState(mesesInicial);
  const [taxa, setTaxa] = useState(Number(taxaMediaAoMes.toFixed(2)));
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busca, setBusca] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<Coluna>("posicao");
  const [direcao, setDirecao] = useState<"asc" | "desc">("asc");

  const resultado = useMemo(() => {
    if (valor <= 0 || meses <= 0 || taxa <= 0) return null;
    return simularPrice(valor, taxa, meses);
  }, [valor, meses, taxa]);

  const buscaNormalizada = removerAcentos(busca.trim().toLowerCase());

  const linhas = useMemo<LinhaTabela[]>(() => {
    const comSimulacao: LinhaTabela[] = taxas.map((t) => ({
      ...t,
      simulacao: valor > 0 && meses > 0 ? simularPrice(valor, t.taxaAoMes, meses) : null,
    }));

    const filtradas = buscaNormalizada
      ? comSimulacao.filter((l) => removerAcentos(l.instituicao.toLowerCase()).includes(buscaNormalizada))
      : comSimulacao;

    const sinal = direcao === "asc" ? 1 : -1;
    return [...filtradas].sort((a, b) => {
      const va = valorOrdenavel(a, ordenarPor);
      const vb = valorOrdenavel(b, ordenarPor);
      if (typeof va === "string" || typeof vb === "string") {
        return sinal * String(va).localeCompare(String(vb), "pt-BR");
      }
      return sinal * (va - vb);
    });
  }, [taxas, valor, meses, buscaNormalizada, ordenarPor, direcao]);

  const buscando = buscaNormalizada.length > 0;
  const linhasExibidas = buscando || mostrarTodos ? linhas : linhas.slice(0, LIMITE_PADRAO);
  const restantes = linhas.length - LIMITE_PADRAO;

  function alternarOrdenacao(coluna: Coluna) {
    if (coluna === ordenarPor) {
      setDirecao((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOrdenarPor(coluna);
      setDirecao("asc");
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Valor desejado
            <input
              type="number"
              min={1}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Prazo (meses)
            <input
              type="number"
              min={1}
              max={360}
              value={meses}
              onChange={(e) => setMeses(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Taxa de juros (% ao mês)
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={taxa}
              onChange={(e) => setTaxa(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Taxa pré-preenchida com a média das instituições financeiras reportada
          ao Banco Central no período mais recente. A taxa que você vai conseguir
          depende do seu perfil de crédito — ajuste o campo acima para simular
          outros cenários.
        </p>

        {resultado && (
          <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-3 dark:border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Parcela mensal</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(resultado.parcela)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total pago ao final</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(resultado.totalPago)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total de juros</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(resultado.totalJuros)}
              </p>
            </div>
          </div>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Taxas médias por instituição
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Média geral do mercado no período: {taxaMediaAoMes.toFixed(2)}% ao mês (
          {mediaAoAno.toFixed(2)}% ao ano). Valores de parcela e total abaixo
          usam o valor e o prazo preenchidos acima.
        </p>

        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar instituição..."
          className="mt-4 w-full max-w-sm rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />

        {buscando && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {linhas.length} {linhas.length === 1 ? "instituição encontrada" : "instituições encontradas"}
          </p>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                {COLUNAS.map((coluna) => (
                  <th key={coluna.chave} className="px-4 py-2 font-medium">
                    <button
                      type="button"
                      onClick={() => alternarOrdenacao(coluna.chave)}
                      className={`flex items-center gap-1 whitespace-nowrap hover:text-zinc-900 dark:hover:text-zinc-100 ${
                        coluna.alinhamento === "right" ? "ml-auto flex-row-reverse" : ""
                      }`}
                    >
                      {coluna.label}
                      {ordenarPor === coluna.chave && <span>{direcao === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhasExibidas.map((l) => (
                <tr key={l.cnpj8} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-500 dark:text-zinc-400">
                    {l.posicao}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <LogoInstituicao nome={l.instituicao} url={logosPorCnpj8[l.cnpj8]} />
                      <div>
                        <div>{l.instituicao}</div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{l.cnpj8}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {l.taxaAoMes.toFixed(2)}%
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {l.taxaAoAno.toFixed(2)}%
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {l.simulacao ? formatarNumero(l.simulacao.parcela) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {l.simulacao ? formatarNumero(l.simulacao.totalPago) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {l.simulacao ? formatarNumero(l.simulacao.totalJuros) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!buscando && restantes > 0 && (
          <button
            type="button"
            onClick={() => setMostrarTodos((v) => !v)}
            className="mt-4 rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {mostrarTodos ? "Ver menos" : `Ver todos (mais ${restantes})`}
          </button>
        )}

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Fonte:{" "}
          <a
            href="https://dadosabertos.bcb.gov.br/dataset/taxas-de-juros-de-operacoes-de-credito"
            className="underline"
          >
            Portal de Dados Abertos do Banco Central do Brasil
          </a>
          . As taxas já incluem os encargos médios da operação, ponderados
          pelo valor contratado em cada instituição.
        </p>
      </section>
    </div>
  );
}

function LogoInstituicao({ nome, url }: { nome: string; url?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="h-6 w-6 shrink-0 object-contain" />;
  }

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: corAvatar(nome) }}
      aria-hidden
    >
      {iniciaisInstituicao(nome)}
    </span>
  );
}
