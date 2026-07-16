"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS_PF = [
  { href: "/credito-pessoal", label: "Crédito pessoal" },
  { href: "/consignado/inss", label: "Consignado", prefixoAtivo: "/consignado" },
  { href: "/financiamento-veiculo", label: "Financiamento de veículo" },
  {
    href: "/financiamento-imobiliario/regulada/tr",
    label: "Financiamento imobiliário",
    prefixoAtivo: "/financiamento-imobiliario",
  },
];

const LINKS_PJ = [
  {
    href: "/capital-giro/prefixado",
    label: "Capital de giro",
    prefixoAtivo: "/capital-giro",
  },
  {
    href: "/conta-garantida/prefixado",
    label: "Conta garantida",
    prefixoAtivo: "/conta-garantida",
  },
  { href: "/cheque-especial-pj", label: "Cheque especial PJ" },
  { href: "/desconto-duplicatas", label: "Desconto de duplicatas" },
];

const PREFIXOS_PJ = ["/capital-giro", "/conta-garantida", "/cheque-especial-pj", "/desconto-duplicatas"];

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

export function NavBar() {
  const pathname = usePathname();
  const emPj = PREFIXOS_PJ.some((prefixo) => pathname.startsWith(prefixo));
  const links = emPj ? LINKS_PJ : LINKS_PF;

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex w-full items-center gap-4 overflow-x-auto px-4 py-3 sm:px-6 lg:w-[70%]">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2">
          <Logomarca />
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            CalculaCredito
          </span>
        </Link>

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

        <div className="ml-auto flex shrink-0 gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {links.map((link) => {
            const ativo = pathname.startsWith(link.prefixoAtivo ?? link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
