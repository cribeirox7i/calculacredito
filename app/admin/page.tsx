import { obterLogosPorCnpj8 } from "@/lib/logos";
import { r2Configurado } from "@/lib/r2";
import { obterSitesPorCnpj8 } from "@/lib/sites";
import { obterTaxasMaquininha } from "@/lib/taxas-maquininha";
import { obterTaxasFgts } from "@/lib/taxas-fgts";
import { obterTaxasHotMoney } from "@/lib/taxas-hotmoney";
import { obterTaxasCartaFianca } from "@/lib/taxas-carta-fianca";
import { obterTaxasCartaoAnuidade } from "@/lib/taxas-cartao-anuidade";
import { obterOperacoesOcultasAtual } from "@/lib/visibilidade-operacoes";
import { AdminTabs } from "./AdminTabs";
import { SecaoInstituicoes } from "./SecaoInstituicoes";
import { SecaoMaquininhas } from "./SecaoMaquininhas";
import { SecaoFgts } from "./SecaoFgts";
import { SecaoHotMoney } from "./SecaoHotMoney";
import { SecaoCartaFianca } from "./SecaoCartaFianca";
import { SecaoCartaoAnuidade } from "./SecaoCartaoAnuidade";
import { SecaoOperacoes } from "./SecaoOperacoes";
import { SecaoSenha } from "./SecaoSenha";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!r2Configurado()) {
    return (
      <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Administração</h1>
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          O storage (Cloudflare R2) ainda não foi configurado neste ambiente.
          Defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e
          R2_BUCKET_NAME antes de usar esta página.
        </p>
      </main>
    );
  }

  const [
    logosPorCnpj8Obj,
    sites,
    taxas,
    taxasFgts,
    taxasHotMoney,
    taxasCartaFianca,
    taxasCartaoAnuidade,
    operacoesOcultas,
  ] = await Promise.all([
    obterLogosPorCnpj8(),
    obterSitesPorCnpj8(),
    obterTaxasMaquininha(),
    obterTaxasFgts(),
    obterTaxasHotMoney(),
    obterTaxasCartaFianca(),
    obterTaxasCartaoAnuidade(),
    obterOperacoesOcultasAtual(),
  ]);

  const logosPorCnpj8 = new Map(Object.entries(logosPorCnpj8Obj));

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:w-[70%]">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Administração</h1>

      <AdminTabs
        instituicoes={<SecaoInstituicoes logosPorCnpj8={logosPorCnpj8} sites={sites} />}
        maquininhas={<SecaoMaquininhas taxas={taxas} />}
        fgts={<SecaoFgts taxas={taxasFgts} />}
        hotmoney={<SecaoHotMoney taxas={taxasHotMoney} />}
        cartaFianca={<SecaoCartaFianca taxas={taxasCartaFianca} />}
        cartaoAnuidade={<SecaoCartaoAnuidade taxas={taxasCartaoAnuidade} />}
        menus={<SecaoOperacoes ocultas={operacoesOcultas} />}
        senha={<SecaoSenha />}
      />
    </main>
  );
}
