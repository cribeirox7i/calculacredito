"use client";

import { useActionState, useRef, useState } from "react";
import { MensagemAcao } from "./MensagemAcao";
import type { ResultadoImportacaoUI } from "./tipos-importacao";

export function ImportadorArquivo({
  titulo,
  action,
  exportarCsvHref,
  exportarXlsxHref,
}: {
  titulo: string;
  action: (estadoAnterior: ResultadoImportacaoUI, formData: FormData) => Promise<ResultadoImportacaoUI>;
  exportarCsvHref: string;
  exportarXlsxHref: string;
}) {
  const [estado, formAction, pendente] = useActionState(action, null);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{titulo}</h3>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Baixar modelo
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden>
              <path d="M5.5 7.5l4.5 5 4.5-5h-9z" />
            </svg>
          </button>
          {menuAberto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
              <div className="absolute left-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                <a
                  href={exportarCsvHref}
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Formato CSV
                </a>
                <a
                  href={exportarXlsxHref}
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Formato Excel (.xlsx)
                </a>
              </div>
            </>
          )}
        </div>

        <form action={formAction} className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            name="arquivo"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => setNomeArquivo(e.target.files?.[0]?.name ?? null)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Escolher arquivo
          </button>
          <span className="max-w-[16rem] truncate text-xs text-zinc-500 dark:text-zinc-400">
            {nomeArquivo ?? "Nenhum arquivo selecionado"}
          </span>
          <button
            type="submit"
            disabled={!nomeArquivo || pendente}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {pendente ? "Importando..." : "Importar arquivo"}
          </button>
        </form>
      </div>

      <MensagemAcao estado={estado} />
    </div>
  );
}
