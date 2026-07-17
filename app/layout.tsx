import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { obterOperacoesOcultas } from "@/lib/visibilidade-operacoes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CalculaCredito - simule com taxas reais do Banco Central",
    template: "%s | CalculaCredito",
  },
  description:
    "Simule crédito pessoal, consignado, financiamento de veículo e imobiliário com taxas médias reportadas ao Banco Central do Brasil.",
  verification: {
    google: "BcDYRCaO04g65qnDPPrsVfHaG3Xkqks1uFhxYMumnwc",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const operacoesOcultas = await obterOperacoesOcultas();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Roda antes da hidratação pra aplicar o tema salvo sem piscar
            (flash) a cor errada antes do React montar. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("tema");if(t!=="claro"&&t!=="escuro"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"escuro":"claro";}if(t==="escuro"){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
        {/* beforeInteractive: única estratégia do next/script que garante o
            script no HTML já renderizado no servidor (afterInteractive só
            injeta via JS depois da hidratação, e o AdSense precisa aparecer
            cedo pro próprio crawler de revisão/veiculação de anúncios do
            Google). Uma tag <script> pura em JSX quebra a hidratação depois,
            porque o próprio AdSense reescreve essa tag em runtime e o React
            (que "possui" o nó) detecta a divergência. */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9190691299034575"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <NavBar ocultas={operacoesOcultas} />
        <div className="flex-1">{children}</div>
        <Footer ocultas={operacoesOcultas} />
      </body>
    </html>
  );
}
