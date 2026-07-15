"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/credito-pessoal", label: "Crédito pessoal" },
  { href: "/consignado/inss", label: "Consignado", prefixoAtivo: "/consignado" },
  { href: "/financiamento-veiculo", label: "Financiamento de veículo" },
  {
    href: "/financiamento-imobiliario/regulada/tr",
    label: "Financiamento imobiliário",
    prefixoAtivo: "/financiamento-imobiliario",
  },
];

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

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex w-full items-center gap-4 overflow-x-auto px-4 py-3 sm:px-6 lg:w-[70%]">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logomarca />
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            CalculaCredito
          </span>
        </Link>

        <div className="flex gap-2">
          {LINKS.map((link) => {
            const ativo = pathname.startsWith(link.prefixoAtivo ?? link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
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
    </nav>
  );
}
