# Plano — CalculaCredito

> Nome do repositório/pacote (`simula-credito`) e da pasta local ficaram como estavam na criação do projeto; o produto foi renomeado para **CalculaCredito** em 2026-07-15/16. Produção: **https://calculacredito.vercel.app**. Repo: `github.com/cribeirox7i/calculacredito`.

## 1. Objetivo e escopo

Site leve, sem banco de dados tradicional e sem login, que simula operações de crédito usando taxas médias de mercado publicadas pelo Banco Central, com conteúdo textual robusto por tipo de operação para indexação orgânica (Google Search) e monetização via AdSense.

**Escopo atual — Pessoa Física e Pessoa Jurídica:**

- **Pessoa Física**: crédito pessoal, crédito consignado (INSS/privado/público), financiamento de veículo, financiamento imobiliário (SFH "reguladas" / SFI "mercado" × prefixado/TR/IPCA).
- **Pessoa Jurídica**: capital de giro (troca automática entre prazo até/acima de 365 dias conforme o valor digitado no campo "prazo" da calculadora — não é seletor de rota separado), conta garantida, cheque especial PJ, desconto de duplicatas.

A home (`app/page.tsx`) é dividida em 2 seções — "Para mim" (PF) e "Para minha empresa" (PJ) — e a navbar (`components/NavBar.tsx`) tem um alternador "Pessoas"/"Empresas" que troca os atalhos exibidos conforme o prefixo da rota atual.

## 2. Arquitetura

- **Next.js 16 + TypeScript + Tailwind**, hospedado na Vercel, seguindo o mesmo padrão do AromaLabTec: frontend estático/SSR + função serverless fazendo proxy servidor-a-servidor para a API do BCB (evita CORS, esconde detalhes de implementação, permite cache).
- **Sem banco de dados**: todas as páginas de modalidade são **estáticas** via `generateStaticParams` + ISR (`revalidate: 86400`) — inclusive as que antes eram dinâmicas via searchParams. Isso resolveu um problema real de lentidão: a API do BCB podia levar mais de 60s pra responder, e páginas dinâmicas rodavam essa chamada a cada acesso.
- **Sem login no site público**: toda simulação (valor, prazo, taxa) é calculada no client, em JS puro, a partir da taxa buscada no servidor. Nenhum dado do usuário é armazenado ou enviado a lugar nenhum — simplifica LGPD (não há dado pessoal coletado). Existe um **painel admin** separado (seção 6) protegido por senha, usado só para gerenciar logos/sites das instituições.
- **Next 16 renomeou `middleware.ts` para `proxy.ts`** — é onde vive a proteção do admin (`proxy.ts`, matcher `/admin/logos/:path*`).
- **Roteamento por tipo de operação**, uma rota estática por modalidade, cada uma com sua própria calculadora + conteúdo, para SEO individual (URLs e title tags específicos por intenção de busca):

| Rota | Modalidade |
|---|---|
| `/credito-pessoal` | Crédito pessoal |
| `/consignado/[tipo]` | Consignado (`inss`/`privado`/`publico`) |
| `/financiamento-veiculo` | Financiamento de veículo |
| `/financiamento-imobiliario/[tipo]` | Imobiliário (combina mercado/regulada + indexador) |
| `/capital-giro/[indexador]` | Capital de giro PJ (`prefixado`/`posfixado`; curto/longo prazo trocado no client) |
| `/conta-garantida/[indexador]` | Conta garantida PJ |
| `/cheque-especial-pj` | Cheque especial PJ |
| `/desconto-duplicatas` | Desconto de duplicatas PJ |
| `/admin/login`, `/admin/logos` | Painel administrativo (logos/sites das instituições) |

## 3. Fonte de dados — API do Banco Central

Dataset: **"Taxas de Juros de Operações de Crédito por Instituição Financeira"**, Portal de Dados Abertos do BCB.

- Endpoint base: `https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata/`
- Formatos: OData/JSON/XML.
- Cada linha traz `InstituicaoFinanceira`, `TaxaJurosAoMes`, `TaxaJurosAoAno`, `Posicao` (ranking) e `cnpj8` — dá pra montar tabela comparativa por banco em todas as modalidades. **Não existe campo de "média de mercado" pronto** — o site calcula a média simples das instituições retornadas (a API não expõe peso por volume contratado nesse nível de detalhe).
- As taxas já representam o custo efetivo médio (juros + encargos) da instituição, não a taxa nominal "de tabela".
- **`codigoModalidade` vem `null` nas linhas de dado** — só existe populado no recurso `ParametrosConsulta`. Por isso o filtro em `lib/bcb.ts` usa o **nome exato da modalidade** (`Modalidade eq '...'`), não o código.
- **Query OData precisa de `encodeURIComponent` manual**, não `URLSearchParams` — a API exige espaço como `%20`, e `URLSearchParams` codifica como `+`, o que quebra o `$filter` no servidor (erro 400).
- Todos os códigos/nomes exatos de modalidade (PF e PJ) ficam centralizados em `lib/modalidades.ts`, validados via o recurso `ParametrosConsulta` (fonte de verdade, evita nome de string "chutado").

### Recurso `TaxasJurosDiariaPorInicioPeriodo` (atualiza a cada 5 dias úteis)
Campos de data: `InicioPeriodo` / `FimPeriodo`. Usado por todas as modalidades PF exceto imobiliário, e por todas as modalidades PJ.

| codigoModalidade | Modalidade | Uso no site |
|---|---|---|
| 221101 | Crédito pessoal não consignado - Prefixado | Crédito pessoal |
| 218101 | Crédito pessoal consignado INSS - Prefixado | Consignado (INSS) |
| 219101 | Crédito pessoal consignado privado - Prefixado | Consignado (privado) |
| 220101 | Crédito pessoal consignado público - Prefixado | Consignado (público) |
| 401101 | Aquisição de veículos - Prefixado | Financiamento de veículo |
| 210101 / 210204 | Capital de giro até 365 dias - Prefixado / Pós-fixado (juros flutuantes) | Capital de giro (curto) |
| 211101 / 211204 | Capital de giro acima de 365 dias - Prefixado / Pós-fixado (juros flutuantes) | Capital de giro (longo) |
| 217101 / 217204 | Conta garantida - Prefixado / Pós-fixado (juros flutuantes) | Conta garantida |
| 216101 | Cheque especial - Prefixado | Cheque especial PJ |
| 301101 | Desconto de duplicatas - Prefixado | Desconto de duplicatas |

### Recurso `TaxasJurosMensalPorMes` (atualiza uma vez por mês)
Campo de data: `anoMes` (formato `"2026-06"`). Único uso: financiamento imobiliário, dividido em "taxas de mercado" (SFI) vs. "taxas reguladas" (SFH) × 3 indexadores:

| codigoModalidade | Modalidade |
|---|---|
| 903101 | Mercado - Prefixado |
| 903201 | Mercado - Pós-fixado referenciado em TR |
| 903203 | Mercado - Pós-fixado referenciado em IPCA |
| 905101 | Regulada - Prefixado |
| 905201 | Regulada - Pós-fixado referenciado em TR |
| 905203 | Regulada - Pós-fixado referenciado em IPCA |

Default do site: "regulada" (SFH) + TR — maior cobertura de instituições observada nos testes. A tela de imobiliário tem um seletor extra (mercado/regulada + indexador) que as outras modalidades não têm.

### Paginação
A API pagina em blocos de até ~5000 linhas sem `@odata.nextLink` visível nos testes — cada consulta filtrada por modalidade + período mais recente retorna um volume pequeno (uma linha por instituição), então não é um problema em produção.

## 4. Motor de cálculo (`lib/amortizacao.ts`)

- **Tabela Price** (sistema francês): parcelas fixas — padrão de mercado para todas as modalidades do site.
- Fórmula padrão de amortização, implementada em JS puro no client, sem dependência externa.
- Mostra **CET (Custo Efetivo Total)** de forma explícita, não só a taxa de juros.
- Simulação recebe: valor, prazo (meses), e usa a taxa média buscada da API (com opção de o usuário ajustar manualmente, já que a taxa real depende do perfil de crédito dele).

## 5. Logos e sites das instituições (`lib/logos.ts`, `lib/sites.ts`)

- **Sem banco de dados tradicional** — tudo fica no **Vercel Blob**, chaveado por **CNPJ8** (não por nome, porque os nomes retornados pelo BCB têm variações).
- **Logos**: um PNG por instituição em `logos/{cnpj8}.png`.
- **Sites**: um único arquivo `sites.json` no Blob, formato `{cnpj8: url}`.
- **Fallback sem Blob configurado**: se `BLOB_READ_WRITE_TOKEN`/`BLOB_STORE_ID` não estiverem definidos, o site funciona normalmente, só que sem logos — cai num avatar com iniciais + cor derivada de hash do nome (`corAvatar`, `iniciaisInstituicao`).
- **Autenticação do Blob**: por OIDC (`BLOB_STORE_ID`) ou token clássico (`BLOB_READ_WRITE_TOKEN`); `lib/logos.ts` checa os dois. **OIDC só funciona em deploys reais** (Production/Preview) — não funciona em `next dev` local nem em `npm run build` local. Testar upload/leitura de Blob sempre em produção.
- **Gotcha crítico de cache**: um fetch com `cache: "no-store"` dentro de uma página estática quebra a regeneração em runtime ("Page changed from static to dynamic") e trava a página na versão antiga pra sempre, silenciosamente. Por isso `lib/sites.ts` tem duas variantes de leitura: `obterSitesPorCnpj8()` (usa `next: {revalidate: 86400}`, para as páginas públicas estáticas) e uma leitura interna com `no-store` usada só dentro das Server Actions do admin (fora de rota estática, seguro ali).

## 6. Painel administrativo (`app/admin/`)

- Rotas: `/admin/login` (form de senha) e `/admin/logos` (upload/gestão de logo + site por instituição, via Server Actions em `app/admin/logos/actions.ts`).
- Autenticação: senha em `ADMIN_PASSWORD` (env var), cookie de sessão assinado (`admin_session`) verificado em `lib/admin-auth.ts` e no `proxy.ts` (matcher só cobre `/admin/logos/:path*` — `/admin/login` fica sempre acessível para permitir o login).
- Uso: correção manual de logos/sites por CNPJ8 quando o fallback automático não é suficiente.

## 7. PDF e compartilhamento (`lib/pdf.ts`)

- Geração de PDF **client-side** via `jsPDF` (import dinâmico, só roda no browser) com a simulação + tabela comparativa de instituições.
- Botão "Compartilhar" usa `navigator.share`/`canShare`, com fallback (download direto) em navegadores sem suporte.
- Título/subtítulo do PDF derivados automaticamente do `titulo` da página, dividindo no primeiro `" - "`.

## 8. Conteúdo e estrutura de páginas (SEO / AdSense)

Cada tipo de operação tem sua própria página com:
1. Calculadora (o "utility hook" que traz tráfego de busca transacional).
2. Explicação conceitual do produto (o que é, como funciona, quem pode contratar).
3. Dicas práticas (o que olhar antes de contratar, erros comuns, como comparar propostas).
4. Explicação de CET, IOF e como interpretar a taxa mostrada.
5. Fonte dos dados citada e link para o BCB (reforça autoridade/confiança — importante porque conteúdo financeiro é categoria YMYL no Google).

**Disclaimer obrigatório em todas as páginas**: o site não é uma instituição financeira, não oferece crédito, não coleta dados pessoais, e os valores simulados são estimativas baseadas em médias de mercado publicadas pelo BCB — não são uma oferta nem substituem consulta a uma instituição financeira real.

Isso importa por dois motivos:
- **Legal**: evita qualquer leitura de que o site está "ofertando crédito" (o que traria obrigações regulatórias que não fazem sentido para um simulador).
- **Google AdSense**: o risco principal não é a política de "personal loans advertisers" do Google Ads (o site não anuncia) — é a qualidade do conteúdo em categoria YMYL para indexação orgânica. Texto genérico repetido só trocando o nome da modalidade tende a ser lido como conteúdo raso; cada página precisa ter conteúdo realmente diferente e substancial.

**Estilo de texto do site**: sem travessão (—), só hífen (-) — pedido explícito do usuário, aplicado em todo o conteúdo.

## 9. Estado atual (2026-07-16)

Escopo completo (PF + PJ) implementado e em produção: **https://calculacredito.vercel.app**. `npm run lint` e `tsc --noEmit` passando limpos. Todas as páginas de modalidade funcionando ponta a ponta com dado real do BCB, verificadas no browser.

### Pendências
- **Deploy**: auto-deploy via GitHub webhook funciona na maioria das vezes, mas já falhou silenciosamente pelo menos duas vezes (uma por timeout real da API do BCB durante o build, outra sem causa aparente). Sempre confirmar com `npx vercel ls calculacredito` e usar `npx vercel --prod` manualmente como fallback se o deploy esperado não aparecer.
- **AdSense**: aprovação pendente (`ca-pub-9190691299034575`, `ads.txt` já configurado).
- **Logos/sites reais**: usuário ainda não subiu logos/sites reais das instituições financeiras (só testou com placeholder no painel admin, já removido).
- Revisão jurídica formal do disclaimer, se o usuário quiser ir além da versão atual (redigida mas não validada por advogado).

## 10. Riscos / decisões em aberto

- Formato de exibição de taxa por banco (tabela comparativa completa vs. só a média) já resolvido a favor da tabela comparativa completa, com fallback de avatar quando não há logo.
- Cobertura de instituições no imobiliário: "regulada + TR" foi escolhido como default por ter a maior cobertura observada nos testes; revisitar se o padrão de mercado mudar.
