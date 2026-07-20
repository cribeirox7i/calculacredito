"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LINKS_PF, LINKS_PJ, PREFIXOS_PJ } from "@/lib/navegacao";

function Logomarca() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      className="shrink-0"
      aria-hidden
    >
      <circle cx="16" cy="16" r="15" fill="#059669" />
      <path
        d="M11 20.5c1.4 1.6 3.1 2.5 5 2.5 3.6 0 6.5-2.9 6.5-6.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M21 11.5c-1.4-1.6-3.1-2.5-5-2.5-3.6 0-6.5 2.9-6.5 6.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M22 8v4h-4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10 24v-4h4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IconeHamburguer({ aberto }: { aberto: boolean }) {
  return aberto ? (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function NavBar({ ocultas }: { ocultas: string[] }) {
  const pathname = usePathname();
  const emPj = PREFIXOS_PJ.some((prefixo) => pathname.startsWith(prefixo));
  const links = (emPj ? LINKS_PJ : LINKS_PF).filter((link) => !ocultas.includes(link.href));
  const [menuAberto, setMenuAberto] = useState(false);
  const [pathnameAnterior, setPathnameAnterior] = useState(pathname);

  // Fecha o painel automaticamente ao navegar - ajuste de estado durante a
  // renderização (padrão recomendado pelo React para "resetar estado quando
  // uma prop muda"), em vez de useEffect, que dispararia um re-render extra.
  if (pathname !== pathnameAnterior) {
    setPathnameAnterior(pathname);
    setMenuAberto(false);
  }

  // Trava o scroll do fundo enquanto o painel está aberto (mesmo padrão de
  // manipulação direta do DOM já usado no ThemeToggle).
  useEffect(() => {
    document.documentElement.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuAberto]);

  const alternadorPfPj = (
    <div className="flex shrink-0 gap-0.5 rounded-full border border-zinc-200 p-0.5 dark:border-zinc-700">
      <Link
        href="/credito-pessoal"
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          !emPj
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        Pessoas
      </Link>
      <Link
        href="/capital-giro/prefixado"
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          emPj
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        Empresas
      </Link>
    </div>
  );

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:w-[70%]">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2">
          <Logomarca />
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            CalculaCredito
          </span>
        </Link>

        {/* Desktop: alternador + tema + links de modalidade, tudo inline. */}
        <div className="hidden w-full flex-wrap items-center gap-x-4 gap-y-2 md:flex md:w-auto">
          {alternadorPfPj}
          <ThemeToggle />
          <div className="flex w-full flex-wrap gap-1.5 md:w-auto">
            {links.map((link) => {
              const ativo = pathname.startsWith(link.prefixoAtivo ?? link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    ativo
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile: botão único que abre/fecha o painel lateral. */}
        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          className="relative z-40 ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 md:hidden"
        >
          <IconeHamburguer aberto={menuAberto} />
        </button>
      </div>

      {/* Backdrop do painel mobile. */}
      <div
        onClick={() => setMenuAberto(false)}
        aria-hidden
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 md:hidden ${
          menuAberto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Painel lateral mobile. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`fixed inset-y-0 right-0 z-30 w-[85%] max-w-sm overflow-y-auto bg-white shadow-xl transition-transform duration-300 dark:bg-black md:hidden ${
          menuAberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Menu</span>
          <button
            type="button"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <IconeHamburguer aberto />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          {alternadorPfPj}
          <ThemeToggle />
        </div>

        <div className="flex flex-col gap-1 px-2 pb-6">
          {links.map((link) => {
            const ativo = pathname.startsWith(link.prefixoAtivo ?? link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                  ativo
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
