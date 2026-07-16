"use client";

import { useState } from "react";
import type { ModalidadeTaxa, TaxaMaquininha } from "@/lib/taxas-maquininha";
import { editarTaxa, removerTaxa } from "./actions-maquininhas";

const ROTULO_MODALIDADE: Record<ModalidadeTaxa, string> = {
  pix: "Pix",
  debito: "Débito",
  credito_vista: "Crédito à vista",
  credito_parcelado: "Crédito parcelado",
};

export function LinhaTaxaMaquininha({ taxa }: { taxa: TaxaMaquininha }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <tr className="border-t border-zinc-100 dark:border-zinc-800">
        <td colSpan={6} className="px-4 py-3">
          <form
            action={async (formData) => {
              await editarTaxa(taxa.id, formData);
              setEditando(false);
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Adquirente
              <input
                type="text"
                name="adquirente"
                required
                defaultValue={taxa.adquirente}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Plano
              <input
                type="text"
                name="plano"
                required
                defaultValue={taxa.plano}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Modalidade
              <select
                name="modalidade"
                required
                defaultValue={taxa.modalidade}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                {Object.entries(ROTULO_MODALIDADE).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Parcelas
              <input
                type="number"
                name="parcelas"
                min={2}
                max={24}
                defaultValue={taxa.parcelas ?? ""}
                className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Taxa (%)
              <input
                type="text"
                name="taxa"
                required
                defaultValue={String(taxa.taxa).replace(".", ",")}
                className="w-20 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Fonte (URL)
              <input
                type="text"
                name="fonteUrl"
                defaultValue={taxa.fonteUrl ?? ""}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-zinc-100 dark:border-zinc-800">
      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{taxa.plano}</td>
      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{ROTULO_MODALIDADE[taxa.modalidade]}</td>
      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{taxa.parcelas ?? "-"}</td>
      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
        {taxa.taxa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}%
      </td>
      <td className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
        {new Date(taxa.atualizadoEm).toLocaleDateString("pt-BR")}
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-xs text-zinc-600 underline dark:text-zinc-400"
          >
            Editar
          </button>
          <form action={removerTaxa.bind(null, taxa.id)}>
            <button type="submit" className="text-xs text-red-600 underline dark:text-red-400">
              Excluir
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
