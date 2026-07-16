"use client";

import { useMemo, useState } from "react";
import type { ModalidadeTaxa, TaxaMaquininha } from "@/lib/taxas-maquininha";
import { corAvatar, iniciaisInstituicao, removerAcentos } from "@/lib/logos";
import { CampoMoeda } from "@/components/CampoMoeda";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ROTULO_MODALIDADE: Record<ModalidadeTaxa, string> = {
  pix: "Pix",
  debito: "Débito",
  credito_vista: "Crédito à vista",
  credito_parcelado: "Crédito parcelado",
};

type Coluna = "posicao" | "adquirente" | "plano" | "taxa" | "valorTaxa" | "valorLiquido";

const COLUNAS: { chave: Coluna; label: string; alinhamento: "left" | "right" }[] = [
  { chave: "posicao", label: "#", alinhamento: "right" },
  { chave: "adquirente", label: "Adquirente", alinhamento: "left" },
  { chave: "plano", label: "Plano", alinhamento: "left" },
  { chave: "taxa", label: "Taxa", alinhamento: "right" },
  { chave: "valorTaxa", label: "Você paga (R$)", alinhamento: "right" },
  { chave: "valorLiquido", label: "Você recebe (R$)", alinhamento: "right" },
];

type LinhaComparativo = TaxaMaquininha & { valorTaxa: number; valorLiquido: number };

export function SimuladorMaquininha({ taxas }: { taxas: TaxaMaquininha[] }) {
  const [valor, setValor] = useState(1000);
  const [modalidade, setModalidade] = useState<ModalidadeTaxa>("debito");
  const [parcelas, setParcelas] = useState(6);
  const [busca, setBusca] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<Coluna>("posicao");
  const [direcao, setDirecao] = useState<"asc" | "desc">("asc");

  const linhasFiltradas = useMemo(() => {
    return taxas.filter((t) => {
      if (t.modalidade !== modalidade) return false;
      if (modalidade === "credito_parcelado") return t.parcelas === parcelas;
      return true;
    });
  }, [taxas, modalidade, parcelas]);

  const buscaNormalizada = removerAcentos(busca.trim().toLowerCase());

  const linhas = useMemo<LinhaComparativo[]>(() => {
    const comCalculo: LinhaComparativo[] = linhasFiltradas.map((t) => {
      const valorTaxa = valor > 0 ? (valor * t.taxa) / 100 : 0;
      return { ...t, valorTaxa, valorLiquido: valor - valorTaxa };
    });

    const filtradas = buscaNormalizada
      ? comCalculo.filter((l) => removerAcentos(l.adquirente.toLowerCase()).includes(buscaNormalizada))
      : comCalculo;

    const ordenadasBase = [...filtradas].sort((a, b) => b.valorLiquido - a.valorLiquido);
    const comPosicao = ordenadasBase.map((l, indice) => ({ ...l, posicaoBase: indice + 1 }));

    if (ordenarPor === "posicao") {
      return direcao === "asc" ? comPosicao : [...comPosicao].reverse();
    }

    const sinal = direcao === "asc" ? 1 : -1;
    return [...comPosicao].sort((a, b) => {
      const va = ordenarPor === "adquirente" || ordenarPor === "plano" ? a[ordenarPor] : a[ordenarPor];
      const vb = ordenarPor === "adquirente" || ordenarPor === "plano" ? b[ordenarPor] : b[ordenarPor];
      if (typeof va === "string" || typeof vb === "string") {
        return sinal * String(va).localeCompare(String(vb), "pt-BR");
      }
      return sinal * ((va as number) - (vb as number));
    });
  }, [linhasFiltradas, valor, buscaNormalizada, ordenarPor, direcao]);

  function alternarOrdenacao(coluna: Coluna) {
    if (coluna === ordenarPor) {
      setDirecao((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOrdenarPor(coluna);
      setDirecao("asc");
    }
  }

  const melhor = linhas[0];

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Valor da venda
            <CampoMoeda
              valor={valor}
              onChange={setValor}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Forma de pagamento
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value as ModalidadeTaxa)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
            >
              {Object.entries(ROTULO_MODALIDADE).map(([valorOpcao, rotulo]) => (
                <option key={valorOpcao} value={valorOpcao}>
                  {rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Parcelas
            <input
              type="number"
              min={2}
              max={24}
              value={parcelas}
              disabled={modalidade !== "credito_parcelado"}
              onChange={(e) => setParcelas(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          O cálculo é direto: valor da venda menos a taxa da maquininha para a
          forma de pagamento escolhida. Não há amortização nem juros - a taxa
          é descontada de uma vez, no repasse da adquirente.
        </p>

        {melhor && (
          <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-3 dark:border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Melhor opção</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {melhor.adquirente} - {melhor.plano}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Taxa descontada</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(melhor.valorTaxa)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Você recebe</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatarMoeda(melhor.valorLiquido)}
              </p>
            </div>
          </div>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Comparativo por adquirente
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Mostrando taxas cadastradas para <strong>{ROTULO_MODALIDADE[modalidade]}</strong>
          {modalidade === "credito_parcelado" ? ` em ${parcelas}x` : ""}. Valores
          calculados com base no valor de venda preenchido acima.
        </p>

        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar adquirente..."
          className="mt-4 w-full max-w-sm rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />

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
              {linhas.map((l, indice) => (
                <tr key={l.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-500 dark:text-zinc-400">
                    {indice + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: corAvatar(l.adquirente) }}
                        aria-hidden
                      >
                        {iniciaisInstituicao(l.adquirente)}
                      </span>
                      {l.fonteUrl ? (
                        <a
                          href={l.fonteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Fonte: ${l.fonteUrl}`}
                          className="hover:underline"
                        >
                          {l.adquirente}
                        </a>
                      ) : (
                        l.adquirente
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{l.plano}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {l.taxa.toFixed(2)}%
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right text-zinc-900 dark:text-zinc-100">
                    {formatarMoeda(l.valorTaxa)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    {formatarMoeda(l.valorLiquido)}
                  </td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={COLUNAS.length} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Nenhuma taxa cadastrada ainda para essa combinação de forma de
                    pagamento{modalidade === "credito_parcelado" ? " e número de parcelas" : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Taxas anunciadas publicamente pelas próprias adquirentes/operadoras,
          cadastradas manualmente neste site - não são uma média oficial de
          mercado. O valor real negociado com sua conta costuma ser diferente
          do anunciado, principalmente conforme seu faturamento mensal. Passe o
          mouse ou toque no nome do adquirente para ver a fonte de cada taxa.
        </p>
      </section>
    </div>
  );
}
