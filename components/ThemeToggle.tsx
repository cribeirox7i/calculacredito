"use client";

import { useSyncExternalStore } from "react";

const CHAVE_ARMAZENAMENTO = "tema";
const ouvintes = new Set<() => void>();

function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

// Lido direto do DOM (já ajustado pelo script inline do layout antes da
// hidratação) em vez de duplicar a lógica de leitura de localStorage/sistema.
function obterSnapshotCliente(): boolean {
  return document.documentElement.classList.contains("dark");
}

// No servidor não há tema conhecido - assume claro, igual ao script inline
// assume até rodar. useSyncExternalStore troca pro valor real do client logo
// após hidratar, sem warning de mismatch (contrato do próprio hook).
function obterSnapshotServidor(): boolean {
  return false;
}

function aplicarTema(escuro: boolean) {
  document.documentElement.classList.toggle("dark", escuro);
  localStorage.setItem(CHAVE_ARMAZENAMENTO, escuro ? "escuro" : "claro");
  for (const ouvinte of ouvintes) ouvinte();
}

export function ThemeToggle() {
  const escuro = useSyncExternalStore(assinar, obterSnapshotCliente, obterSnapshotServidor);

  return (
    <button
      type="button"
      onClick={() => aplicarTema(!escuro)}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      title={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
    >
      {escuro ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
