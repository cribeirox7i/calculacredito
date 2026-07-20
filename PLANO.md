# Plano — CalculaCredito

> Nome do repositório/pacote (`simula-credito`) e da pasta local ficaram como estavam na criação do projeto; o produto foi renomeado para **CalculaCredito** em 2026-07-15/16. Produção: **https://calculacredito.com.br** (domínio próprio; `calculacredito.vercel.app` continua funcionando). Repo: `github.com/cribeirox7i/calculacredito`.

## 1. Objetivo e escopo

Site leve, sem banco de dados tradicional e sem login, que simula operações de crédito usando taxas médias de mercado publicadas pelo Banco Central, com conteúdo textual robusto por tipo de operação para indexação orgânica (Google Search) e monetização via AdSense.

**Escopo atual — Pessoa Física e Pessoa Jurídica:**

- **Pessoa Física**: crédito pessoal, crédito consignado (INSS/privado/público), financiamento de veículo, financiamento imobiliário (SFH "reguladas" / SFI "mercado" × prefixado/TR/IPCA), **saque-aniversário FGTS**, **antecipação do saque-aniversário FGTS**, **juros de cartão de crédito** (rotativo/parcelado, dado do BCB), **anuidade e benefícios de cartão de crédito** (curado no admin).
- **Pessoa Jurídica**: capital de giro (troca automática entre prazo até/acima de 365 dias conforme o valor digitado no campo "prazo" da calculadora — não é seletor de rota separado), conta garantida, cheque especial PJ, desconto de duplicatas, **maquininha de cartão**, **hot money**, **carta fiança**.

A home (`app/page.tsx`) é dividida em 2 seções — "Para mim" (PF) e "Para minha empresa" (PJ) — e a navbar (`components/NavBar.tsx`) tem um alternador "Pessoas"/"Empresas" que troca os atalhos exibidos conforme o prefixo da rota atual (`lib/navegacao.ts` centraliza `LINKS_PF`/`LINKS_PJ`/`PREFIXOS_PJ`, compartilhado entre NavBar e Footer). Qualquer operação pode ser ocultada desses menus (NavBar/rodapé/home) sem deploy, pelo admin — ver seção 7.

**Menu mobile (2026-07-19)**: abaixo do breakpoint `md`, a barra de links inline (que quebrava em várias linhas e consumia espaço vertical excessivo no celular) some e vira um botão hambúrguer que abre um painel lateral (`fixed inset-y-0 right-0`, `translate-x` + `transition-transform`) com o alternador Pessoas/Empresas, o `ThemeToggle` e os links em coluna. Scroll do fundo travado via `document.documentElement.style.overflow` enquanto o painel está aberto (mesmo padrão de manipulação direta do DOM do `ThemeToggle.tsx`). Desktop (`md:` e acima) não mudou.

## 2. Arquitetura

- **Next.js 16 + TypeScript + Tailwind**, hospedado na **Vercel** (plano Hobby, grátis). Storage em **Cloudflare R2** (seção 5) — arquitetura híbrida deliberada, ver motivo na seção 5.
- **Sem banco de dados relacional**: todas as páginas de modalidade com dado do BCB são **estáticas** via `generateStaticParams` + ISR (`revalidate: 86400`). As operações curadas manualmente (maquininha, FGTS, hot money, carta fiança) também são estáticas, revalidadas via `revalidatePath` quando o admin salva algo.
- **Sem login no site público**: toda simulação é calculada no client, em JS puro. Nenhum dado do usuário é armazenado. Existe um **painel admin unificado** (seção 6) protegido por senha.
- **Next 16 renomeou `middleware.ts` para `proxy.ts`** — é onde vive a proteção do admin.
- **Roteamento por tipo de operação**, uma rota estática por modalidade/produto:

| Rota | Modalidade | Fonte de dado |
|---|---|---|
| `/credito-pessoal` | Crédito pessoal | BCB |
| `/consignado/[tipo]` | Consignado (`inss`/`privado`/`publico`) | BCB |
| `/financiamento-veiculo` | Financiamento de veículo | BCB |
| `/financiamento-imobiliario/[tipo]/[indexador]` | Imobiliário (mercado/regulada × prefixado/TR/IPCA) | BCB |
| `/capital-giro/[indexador]` | Capital de giro PJ | BCB |
| `/conta-garantida/[indexador]` | Conta garantida PJ | BCB |
| `/cheque-especial-pj` | Cheque especial PJ | BCB |
| `/desconto-duplicatas` | Desconto de duplicatas PJ | BCB |
| `/saque-aniversario` | Saque-aniversário FGTS | Tabela oficial fixa (`lib/saque-aniversario.json`) |
| `/antecipacao-fgts` | Antecipação do saque-aniversário | Curado no admin (sem fonte oficial) |
| `/cartao-credito/[tipo]` | Juros de cartão de crédito (`rotativo`/`parcelado`) | BCB |
| `/anuidade-cartao` | Anuidade e benefícios de cartão de crédito | Curado no admin (sem fonte oficial) |
| `/maquininha-de-cartao` | Taxas de maquininha (MDR) | Curado no admin |
| `/hot-money` | Empréstimo de curtíssimo prazo PJ | Curado no admin |
| `/carta-fianca` | Garantia bancária PJ | Curado no admin |
| `/admin` | Painel administrativo unificado (7 abas) | - |
| `/sitemap.xml`, `/robots.txt` | SEO (gerados por `app/sitemap.ts`/`app/robots.ts`) | - |

## 3. Fonte de dados — API do Banco Central

Dataset: **"Taxas de Juros de Operações de Crédito por Instituição Financeira"**, Portal de Dados Abertos do BCB.

- Endpoint base: `https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata/`
- Cada linha traz `InstituicaoFinanceira`, `TaxaJurosAoMes`, `TaxaJurosAoAno`, `Posicao` (ranking) e `cnpj8`. **Não existe campo de "média de mercado" pronto** — o site calcula a média simples das instituições retornadas.
- **`codigoModalidade` vem `null` nas linhas de dado** — só existe populado no recurso `ParametrosConsulta` (que usa `segmento`/`modalidade` em minúsculas, diferente dos outros recursos - atenção ao montar o filtro). Por isso o filtro em `lib/bcb.ts` usa o **nome exato da modalidade**.
- **Query OData precisa de `encodeURIComponent` manual**, não `URLSearchParams` (o `+` vs `%20` quebra o `$filter` com erro 400).
- Todos os códigos/nomes exatos de modalidade (PF e PJ) ficam centralizados em `lib/modalidades.ts`, validados via `ParametrosConsulta`.
- **CDI**: buscado à parte via SGS (série 4389, `fetchTaxaCDI` em `lib/bcb.ts`), usado nas simulações pós-fixadas (capital de giro e conta garantida) para converter "CDI × %" em taxa mensal efetiva (`taxaAnualParaMensal` em `lib/amortizacao.ts`).
- **Confirmado que NÃO existem no BCB** (verificado via `ParametrosConsulta`, todos os 29 registros de PF+PJ): saque-aniversário FGTS, antecipação FGTS, hot money, carta fiança, maquininha de cartão, anuidade/benefícios de cartão de crédito. Por isso essas 6 operações usam o modelo de curadoria manual (seção 7) em vez de dado oficial.
- **Cartão de crédito - juros** (`204101` rotativo total, `215101` parcelado, ambos `segmento: Pessoa Física`) **existe sim** no BCB, confirmado em 2026-07-19 via `ParametrosConsulta` e testado com dado real no recurso diário - por isso usa dado oficial (`lib/modalidades.ts` → `MODALIDADES_CARTAO`), diferente da anuidade do mesmo cartão, que não é reportada ao BC.

### Recurso `TaxasJurosDiariaPorInicioPeriodo` (atualiza a cada 5 dias úteis)
Usado por todas as modalidades PF exceto imobiliário, e por todas as modalidades PJ com dado oficial (capital de giro, conta garantida, cheque especial, desconto de duplicatas).

### Recurso `TaxasJurosMensalPorMes` (atualiza uma vez por mês)
Único uso: financiamento imobiliário (`anoMes`, formato `"2026-06"`). Default do site: "regulada" (SFH) + TR.

## 4. Motor de cálculo

- **`lib/amortizacao.ts`**: Tabela Price (parcelas fixas), padrão para as 8 modalidades com dado do BCB. Mostra CET explicitamente.
- **`lib/iof.ts`** + `lib/iof.json`: IOF (Imposto sobre Operações Financeiras) somado ao total pago em todas as simulações de crédito exceto financiamento imobiliário residencial PF (isento por lei). Alíquotas em JSON separado (fonte/data documentadas no arquivo) porque mudam por decreto - **revisar periodicamente**, houve controvérsia regulatória em 2025 (decretos + decisão do STF).
- **`lib/saque-aniversario.ts`**: tabela oficial de alíquotas por faixa de saldo (Lei 8.036/1990, art. 20-B) - cálculo direto, sem juros.
- **`lib/fgts-antecipacao.ts`**: valor presente das parcelas anuais futuras do saque-aniversário, descontadas mês a mês pela taxa da instituição (juros compostos).
- **`lib/hotmoney.ts`**: juros simples pro-rata pelos dias corridos (produto de curtíssimo prazo, pago de uma vez no vencimento, não parcelado).
- **`lib/carta-fianca.ts`**: taxa anual de serviço proporcional ao prazo do contrato (não é empréstimo, sem juros compostos).

## 5. Storage — Cloudflare R2 (migrado do Vercel Blob em 2026-07-17)

**Histórico**: o projeto usava Vercel Blob desde o início. Em 2026-07-17 a cota gratuita de Advanced Requests do Blob (2.000/mês) estourou 100% e a Vercel avisou que o acesso seria pausado por 30 dias, sem opção de renovação antecipada no plano gratuito. Causa provável: muitos deploys em sequência numa única sessão de desenvolvimento (cada build refaz operações de listagem em várias páginas) somado ao painel admin antigo fazendo várias chamadas de listagem sem cache a cada carregamento de tela. Migrado no mesmo dia para **Cloudflare R2**.

- **Por quê R2**: compatível com S3, tier gratuito de 1M operações Classe A (escrita/listagem) + 10M Classe B (leitura) por mês - cerca de 500x mais folga que o Blob. Hospedagem continua 100% na Vercel; só a camada de storage mudou.
- **Bucket**: `calculacredito`, **100% privado** (sem URL pública, sem custom domain configurado na Cloudflare).
- **Camada de acesso**: `lib/r2.ts` - cliente `@aws-sdk/client-s3` (`region: "auto"`, endpoint `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`), helpers `lerObjetoTexto`/`lerObjetoBuffer`/`gravarObjeto`/`excluirObjeto`/`listarObjetosComPrefixo`/`r2Configurado`.
- **Env vars** (`.env.local` local + 3 ambientes na Vercel): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.
- **JSON** (`taxas-maquininha.json`, `taxas-fgts.json`, `taxas-hotmoney.json`, `taxas-carta-fianca.json`, `sites.json`, `admin-senha.json`, `operacoes-ocultas.json`): lido/escrito **direto por chave** via `GetObjectCommand`/`PutObjectCommand` - **sem** o padrão antigo do Blob (`list()` pra descobrir a URL, depois `fetch(url)`), que gerava operações de listagem caras só pra achar um arquivo cujo caminho já era conhecido.
- **Logos** (PNG por CNPJ8, `logos/{cnpj8}.png`): como o bucket é privado, servidos por uma rota própria **`app/logo/[cnpj8]/route.ts`** que faz proxy de um `GetObjectCommand` (404 se não existir, `Cache-Control: public, max-age=86400`). `lib/logos.ts`'s `obterLogosPorCnpj8()` devolve `/logo/{cnpj8}` (caminho same-origin) em vez de URL direta - usado tanto no admin (`SecaoInstituicoes.tsx`) quanto nas tabelas comparativas públicas (`SimuladorInterativo.tsx`, componente `LogoInstituicao`).
- **Sem cache de fetch do Next**: como as leituras usam o SDK do S3 (não `fetch()`), não passam pelo Data Cache do Next - o "gotcha" antigo do Blob (`no-store` quebrando páginas estáticas) não existe mais nesse formato. O cache que importa agora é o de **rota/página** (Full Route Cache + ISR + `revalidatePath` explícito nas Server Actions), não o de fetch individual.
- **Sem a limitação de OIDC**: R2 autentica por chave simples, funciona igual em `next dev` local e em produção - diferente do Blob (só funcionava em deploys reais). Isso permitiu testar o CRUD completo do admin localmente pela primeira vez.
- **Cuidado**: o bucket é o mesmo em dev e produção, não existe ambiente de teste separado - qualquer escrita feita localmente é real. Sempre limpar dados de teste depois de testar.
- **Fallback sem R2 configurado**: se as env vars não estiverem definidas, o site funciona normalmente (todas as funções de leitura devolvem vazio/nulo em vez de lançar erro), só sem dados curados - cai no fallback de avatar com iniciais pros logos.
- **Dado antigo do Blob não foi migrado automaticamente** - o bucket R2 começou vazio. Taxas de maquininha que já existiam precisam ser recadastradas (usuário tinha backup em CSV e reimportou pelo próprio admin).

## 6. Painel administrativo unificado (`app/admin/`)

Uma única rota `/admin` (não mais `/admin/logos`), com 8 abas (`AdminTabs.tsx`): **Instituições**, **Maquininhas**, **Antecipação FGTS**, **Hot Money**, **Carta Fiança**, **Anuidade de Cartão**, **Menus**, **Senha**.

- **Autenticação**: senha em `ADMIN_PASSWORD` (env var) ou hash salvo no R2 (`admin-senha.json`, PBKDF2-SHA256, 210k iterações) se o admin já trocou a senha pelo painel. Cookie de sessão assinado (`admin_session`, HMAC-SHA256) verificado em `lib/admin-auth.ts` e no `proxy.ts` (matcher cobre `/admin` + todas as rotas de exportação CSV/XLSX).
- **Padrão de cada aba de dado curado** (Maquininhas/FGTS/Hot Money/Carta Fiança/Anuidade de Cartão, todas seguem a mesma estrutura): `lib/taxas-*.ts` (CRUD no R2), `lib/planilha-*.ts` (template CSV/XLSX + validação de import, delimitador `;` porque a taxa usa vírgula decimal, BOM no início pro Excel abrir como UTF-8), `app/admin/actions-*.ts` (Server Actions), `FormAdicionarTaxa*.tsx`/`LinhaTaxa*.tsx`/`BotaoLimparTaxas*.tsx`/`Secao*.tsx` (UI), rota de exportação CSV/XLSX protegida no `proxy.ts`.
- **Feedback de sucesso/erro**: todos os formulários de "salvar" usam `useActionState` + componente compartilhado `MensagemAcao` (`app/admin/MensagemAcao.tsx`, tipo `EstadoAcao`) - mostram mensagem de sucesso/erro em vez de nada, e capturam exceptions das Server Actions em vez de derrubar a página na tela de erro genérica do Next quando a validação falha.
- **Aba Menus** (`lib/visibilidade-operacoes.ts`): checkbox marcado = visível (semântica corrigida depois de feedback do usuário - inicialmente estava invertida). Desmarcar oculta a operação do NavBar/rodapé/home simultaneamente, sem precisar de deploy. Página continua acessível por link direto.
- **Cursor**: regra global em `app/globals.css` (`button:not(:disabled), [role="button"] { cursor: pointer }`) - o Preflight do Tailwind não define isso desde a v3.3, então botões mostravam cursor de seta padrão.

## 7. Modelo de curadoria manual (operações sem dado oficial do BCB)

Usado por Maquininha, Antecipação FGTS, Hot Money e Carta Fiança - todas confirmadas via `ParametrosConsulta` como **não reportadas ao BCB**. Padrão comum:

1. Admin cadastra manualmente (form individual) ou em lote (CSV/Excel) as taxas por instituição/adquirente.
2. Reimportar um arquivo **substitui só as linhas da(s) instituição(ões) presentes nele** - instituições ausentes do arquivo não são afetadas (evita perder cadastro ao reimportar uma planilha parcial).
3. Página pública compara as opções cadastradas, ordenadas pelo melhor resultado pro usuário (menor custo ou maior valor recebido, dependendo do produto).
4. Disclaimer específico em cada página: taxas anunciadas publicamente pelas instituições, cadastradas manualmente, **não são uma média oficial de mercado** (diferente das simulações com dado do BCB).

Diferenças de cálculo entre elas (não são todas Tabela Price):
- **Maquininha**: desconto direto sobre o valor da venda (MDR), sem juros nem prazo.
- **Antecipação FGTS**: valor presente com juros compostos mensais (mesma lógica de desconto de um financiamento, "ao contrário").
- **Hot Money**: juros simples pro-rata por dias, pago de uma vez no vencimento (não parcelado).
- **Carta Fiança**: taxa de serviço anual proporcional ao prazo, sem juros - não é empréstimo.

## 8. PDF e compartilhamento (`lib/pdf.ts`)

Geração client-side via `jsPDF` (import dinâmico) com a simulação + tabela comparativa + IOF quando aplicável. Botão "Compartilhar" via `navigator.share`/`canShare` com fallback. Título/subtítulo derivados automaticamente do `titulo` da página no primeiro `" - "`.

## 9. SEO

- **`app/sitemap.ts`**: gera `/sitemap.xml` com as 25 URLs públicas (19 estáticas + 6 combinações de financiamento imobiliário). `/admin` fica de fora de propósito.
- **`app/robots.ts`**: gera `/robots.txt`, libera tudo exceto `/admin`, aponta pro sitemap.
- **Google Search Console**: verificação via meta tag (`verification.google` no `layout.tsx`). Submissão do sitemap deu erro "não foi possível buscar" na primeira tentativa (provavelmente janela de propagação do deploy) - funcionou na segunda tentativa, sem mudança de código.
- **AdSense** (`ca-pub-9190691299034575`): script carrega corretamente via `next/script strategy="beforeInteractive"` (única estratégia que garante o script no HTML já renderizado no servidor - `afterInteractive` não aparece no SSR, e uma tag `<script>` pura quebra a hidratação porque o próprio AdSense reescreve o nó em runtime). Auto Ads ativo, cria o slot automaticamente, mas retorna `data-ad-status="unfilled"` - implementação correta, resultado normal pra site novo/em revisão ou tráfego de teste automatizado. Não é um bug de código.

**Disclaimer obrigatório em todas as páginas de simulação**: o site não é uma instituição financeira, não oferece crédito, não coleta dados pessoais, valores são estimativas - importa tanto por motivo legal (evitar leitura de "oferta de crédito") quanto de qualidade de conteúdo pro AdSense (categoria YMYL, texto raso/repetido é penalizado).

**Estilo de texto do site**: sem travessão (—), só hífen (-) - pedido explícito do usuário, aplicado em todo o conteúdo, incluindo este documento.

## 10. Estado atual (2026-07-19)

Escopo (PF + PJ, 15 modalidades + painel admin com 8 abas) implementado e em produção: **https://calculacredito.com.br**. Storage migrado de Vercel Blob (pausado por estouro de cota) para Cloudflare R2, testado ponta a ponta em produção. Sitemap e robots.txt no ar e submetidos ao Search Console.

**Adicionado em 2026-07-19**: menu mobile compacto (hambúrguer + painel lateral, ver seção 1) e comparador de cartão de crédito em duas partes - juros do rotativo/parcelado com dado oficial do BCB (`/cartao-credito/[tipo]`) e anuidade/benefícios curados no admin (`/anuidade-cartao`, 8ª aba do painel).

### Pendências
- **Dados de maquininha**: já recadastrados via CSV de backup depois da migração pro R2 (bucket novo tinha começado vazio) - resolvido.
- **Dados de anuidade de cartão**: aba nova no admin, ainda sem nenhum cartão cadastrado - usuário precisa popular manualmente ou via CSV/Excel.
- **AdSense**: aguardando aprovação/revisão do site e tráfego real crescer - implementação técnica confirmada correta (script carrega, Auto Ads cria slot, retorna "unfilled").
- **Logos/sites reais das instituições**: segue pendente desde o início do projeto - usuário ainda não subiu logos/sites reais (só testou com placeholder, já removido).
- Revisão jurídica formal do disclaimer, se o usuário quiser ir além da versão atual.
- **Cadência de deploy**: agrupar mudanças em lotes maiores antes de publicar (lição do incidente de cota) - vale mesmo com a folga maior do R2, boa prática geral.

## 11. Riscos / decisões em aberto

- Formato de exibição de taxa por banco (tabela comparativa completa vs. só a média): resolvido a favor da tabela comparativa completa, com fallback de avatar quando não há logo.
- Cobertura de instituições no imobiliário: "regulada + TR" como default por maior cobertura observada; revisitar se o padrão de mercado mudar.
- Se o volume de dados crescer muito (ex.: centenas de instituições por produto), o padrão atual de "ler o JSON inteiro, modificar em memória, regravar o arquivo inteiro" pode precisar ser revisto - funciona bem pro volume atual (dezenas de linhas, edição sequencial por um único admin), mas não escala para escrita concorrente de múltiplos usuários nem para volumes muito grandes (ver conversa de 2026-07-17 sobre por que esse padrão não serve pra um CRM, por exemplo).
