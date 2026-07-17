"use client";

import { useState, type ReactNode } from "react";

const ABAS = [
  { id: "instituicoes", label: "Instituições" },
  { id: "maquininhas", label: "Maquininhas" },
  { id: "fgts", label: "Antecipação FGTS" },
  { id: "senha", label: "Senha" },
] as const;

type AbaId = (typeof ABAS)[number]["id"];

export function AdminTabs({
  instituicoes,
  maquininhas,
  fgts,
  senha,
}: {
  instituicoes: ReactNode;
  maquininhas: ReactNode;
  fgts: ReactNode;
  senha: ReactNode;
}) {
  const [aba, setAba] = useState<AbaId>("instituicoes");
  const conteudoPorAba: Record<AbaId, ReactNode> = { instituicoes, maquininhas, fgts, senha };

  return (
    <div>
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              aba === a.id
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-6">{conteudoPorAba[aba]}</div>
    </div>
  );
}
