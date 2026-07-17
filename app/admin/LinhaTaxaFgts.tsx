"use client";

import { useState } from "react";
import type { TaxaFgts } from "@/lib/taxas-fgts";
import { editarTaxa, removerTaxa } from "./actions-fgts";

export function LinhaTaxaFgts({ taxa }: { taxa: TaxaFgts }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <tr className="border-t border-zinc-100 dark:border-zinc-800">
        <td colSpan={5} className="px-4 py-3">
          <form
            action={async (formData) => {
              await editarTaxa(taxa.id, formData);
              setEditando(false);
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Instituição
              <input
                type="text"
                name="instituicao"
                required
                defaultValue={taxa.instituicao}
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
              Taxa mensal (%)
              <input
                type="text"
                name="taxaMensal"
                required
                defaultValue={String(taxa.taxaMensal).replace(".", ",")}
                className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Prazo máx. (anos)
              <input
                type="number"
                name="prazoMaximoAnos"
                min={1}
                max={10}
                required
                defaultValue={taxa.prazoMaximoAnos}
                className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
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
      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">
        {taxa.taxaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}% a.m.
      </td>
      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-100">{taxa.prazoMaximoAnos} anos</td>
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
