"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/credito-pessoal", label: "Crédito pessoal" },
  { href: "/consignado/inss", label: "Consignado", prefixoAtivo: "/consignado" },
  { href: "/financiamento-veiculo", label: "Financiamento de veículo" },
  {
    href: "/financiamento-imobiliario/regulada/tr",
    label: "Financiamento imobiliário",
    prefixoAtivo: "/financiamento-imobiliario",
  },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
        {LINKS.map((link) => {
          const ativo =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.prefixoAtivo ?? link.href);

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
    </nav>
  );
}
