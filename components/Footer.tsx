import Link from "next/link";
import { LINKS_PF, LINKS_PJ } from "@/lib/navegacao";

export function Footer({ ocultas }: { ocultas: string[] }) {
  const ano = new Date().getFullYear();
  const linksPF = LINKS_PF.filter((link) => !ocultas.includes(link.href));
  const linksPJ = LINKS_PJ.filter((link) => !ocultas.includes(link.href));

  return (
    <footer className="mt-16 bg-black text-white">
      <div className="mx-auto w-full px-4 py-10 sm:px-6 lg:w-[70%]">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-400">Simulações PF</h3>
            <ul className="mt-3 space-y-2">
              {linksPF.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-200 hover:text-white hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-400">Simulações PJ</h3>
            <ul className="mt-3 space-y-2">
              {linksPJ.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-200 hover:text-white hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-400">Institucional</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/quem-somos" className="text-sm text-zinc-200 hover:text-white hover:underline">
                  Quem somos
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="text-sm text-zinc-200 hover:text-white hover:underline">
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
          © {ano} CalculaCredito. Não somos uma instituição financeira - simulações baseadas em taxas médias
          públicas, não são uma oferta de crédito.
        </div>
      </div>
    </footer>
  );
}
