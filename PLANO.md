# Plano — Simulador de Crédito para Pessoas Físicas

## 1. Objetivo e escopo da v1

Site leve, sem banco de dados e sem login, que simula operações de crédito usando taxas médias de mercado publicadas pelo Banco Central, com conteúdo textual robusto por tipo de operação para indexação orgânica (Google Search) e monetização via AdSense.

**Escopo v1** (atualizado após validar a API real — ver seção 3): crédito pessoal, crédito consignado, financiamento de veículo **e financiamento imobiliário**. A suposição inicial de que imobiliário não tinha dado por instituição estava errada — ele existe, só que vem num recurso mensal separado com uma escolha extra de indexador. Como o custo de incluir é baixo, decidimos entrar com as 4 modalidades desde o início.

## 2. Arquitetura

- **Next.js + Vercel**, seguindo o mesmo padrão do AromaLabTec: frontend estático/SSR + função serverless fazendo proxy servidor-a-servidor para a API do BCB (evita CORS, esconde detalhes de implementação, permite cache).
- **Sem banco de dados**: as taxas ficam em cache via ISR (Incremental Static Regeneration) ou cache de edge — revalidação a cada 24h é suficiente, já que o BCB publica médias a cada poucos dias úteis.
- **Sem login**: toda simulação (valor, prazo, taxa) é calculada no client, em JS puro, a partir da taxa buscada no servidor. Nenhum dado do usuário é armazenado ou enviado a lugar nenhum — isso também simplifica LGPD (não há dado pessoal coletado).
- **Roteamento por tipo de operação**: uma rota estática por modalidade (`/credito-pessoal`, `/consignado`, `/financiamento-veiculo`), cada uma com sua própria calculadora + conteúdo, para SEO individual (URLs e title tags específicos por intenção de busca).

## 3. Fonte de dados — API do Banco Central (validado com chamadas reais em 2026-07-14)

Dataset: **"Taxas de Juros de Operações de Crédito por Instituição Financeira"**, Portal de Dados Abertos do BCB.

- Endpoint base: `https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata/`
- Formatos: OData/JSON/XML.
- Cada linha traz `InstituicaoFinanceira`, `TaxaJurosAoMes`, `TaxaJurosAoAno`, `Posicao` (ranking) e `cnpj8` — ou seja, dá pra montar tabela comparativa por banco em todas as modalidades abaixo. **Não existe campo de "média de mercado" pronto** — precisamos calcular a média simples das instituições retornadas (a API não expõe peso por volume contratado nesse nível de detalhe).
- As taxas já representam o custo efetivo médio (juros + encargos) da instituição, não a taxa nominal "de tabela".

### Recurso `TaxasJurosDiariaPorInicioPeriodo` (atualiza a cada 5 dias úteis)
Campos de data: `InicioPeriodo` / `FimPeriodo` (não `DataInicioPeriodo`). Filtrar por `Segmento eq 'Pessoa Física'` ou pelo `codigoModalidade`:

| codigoModalidade | Modalidade | Uso no site |
|---|---|---|
| 221101 | Crédito pessoal não consignado - Prefixado | Crédito pessoal |
| 218101 | Crédito pessoal consignado INSS - Prefixado | Consignado (aba INSS) |
| 219101 | Crédito pessoal consignado privado - Prefixado | Consignado (aba privado) |
| 220101 | Crédito pessoal consignado público - Prefixado | Consignado (aba público) |
| 401101 | Aquisição de veículos - Prefixado | Financiamento de veículo |

### Recurso `TaxasJurosMensalPorMes` (atualiza uma vez por mês)
Campo de data: `anoMes` (formato `"2026-06"`). Financiamento imobiliário está aqui, dividido em "taxas de mercado" vs "taxas reguladas" × 3 indexadores:

| codigoModalidade | Modalidade |
|---|---|
| 903101 | Financiamento imobiliário com taxas de mercado - Prefixado |
| 903201 | Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em TR |
| 903203 | Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em IPCA |
| 905101 | Financiamento imobiliário com taxas reguladas - Prefixado |
| 905201 | Financiamento imobiliário com taxas reguladas - Pós-fixado referenciado em TR |
| 905203 | Financiamento imobiliário com taxas reguladas - Pós-fixado referenciado em IPCA |

A tela de imobiliário precisa de um seletor extra (mercado/regulada + indexador) que as outras 3 modalidades não têm — maior cobertura de instituições observada foi em "taxas de mercado - Pós-fixado referenciado em TR" e "taxas reguladas - Pós-fixado referenciado em TR".

### Descoberta de todos os parâmetros válidos
O recurso `ParametrosConsulta` retorna a lista completa e autoritativa de combinações `codigoSegmento`/`codigoModalidade`/`modalidade` — é a fonte de verdade para não depender de nomes de string "chutados". Também existe `401101`-adjacente `1205101` ("Arrendamento mercantil de veículos" / leasing), que pode virar uma opção extra dentro da página de veículo no futuro.

### Paginação
A API pagina em blocos de até ~5000 linhas por chamada sem `@odata.nextLink` visível nos testes — para uso em produção, cada consulta filtrada por `codigoModalidade` + período mais recente retorna um volume pequeno (uma linha por instituição), então não deve ser um problema.

## 4. Motor de cálculo

- **Tabela Price** (sistema francês): parcelas fixas — padrão de mercado para crédito pessoal, consignado e veículo no Brasil.
- Fórmula padrão de amortização, implementada em JS puro no client, sem dependência externa.
- **Mostrar CET (Custo Efetivo Total)** de forma explícita, não só a taxa de juros — é prática esperada em simuladores de crédito no Brasil e reforça credibilidade (E-E-A-T) para SEO em conteúdo financeiro.
- Simulação recebe: valor, prazo (meses), e usa a taxa média buscada da API (com opção de o usuário ajustar manualmente, já que a taxa real depende do perfil de crédito dele).

## 5. Conteúdo e estrutura de páginas (SEO / AdSense)

Cada tipo de operação tem sua própria página com:
1. Calculadora (o "utility hook" que traz tráfego de busca transacional).
2. Explicação conceitual do produto (o que é, como funciona, quem pode contratar).
3. Dicas práticas (o que olhar antes de contratar, erros comuns, como comparar propostas).
4. Explicação de CET, IOF e como interpretar a taxa mostrada.
5. Fonte dos dados citada e link para o BCB (reforça autoridade/confiança — importante porque conteúdo financeiro é categoria YMYL no Google).

**Disclaimer obrigatório em todas as páginas**: o site não é uma instituição financeira, não oferece crédito, não coleta dados pessoais, e os valores simulados são estimativas baseadas em médias de mercado publicadas pelo BCB — não são uma oferta nem substituem consulta a uma instituição financeira real.

Isso importa por dois motivos:
- **Legal**: evita qualquer leitura de que o site está "ofertando crédito" (o que traria obrigações regulatórias que não fazem sentido para um simulador).
- **Google Ads/AdSense**: como você quer publicar AdSense (não anunciar), o risco principal não é a política de "personal loans advertisers" do Google Ads — é a qualidade do conteúdo em categoria YMYL para indexação orgânica. Texto genérico repetido em 3 páginas só trocando o nome da modalidade tende a ser lido como conteúdo raso; cada página precisa ter conteúdo realmente diferente e substancial.

## 6. Fases de implementação sugeridas

1. ~~Validar mapeamento de modalidades na API do BCB~~ — feito (ver seção 3).
2. ~~Esqueleto Next.js + 1 modalidade ponta a ponta~~ — feito: `/credito-pessoal` funcionando com dado real do BCB.
3. ~~Replicar para consignado (3 abas: INSS/privado/público) e veículo~~ — feito: `/consignado` (com seletor de tipo via querystring) e `/financiamento-veiculo`, reaproveitando o componente `SimuladorModalidade`.
4. ~~Implementar imobiliário~~ — feito: `/financiamento-imobiliario`, com seletor de mercado/regulada (SFI/SFH) + indexador (prefixado/TR/IPCA) via querystring, recurso mensal da API.
5. ~~Conteúdo textual completo das 4 páginas~~ — feito.
6. Revisão de disclaimers/compliance — feito o disclaimer base em todas as páginas; falta revisão jurídica formal se o usuário quiser.
7. Deploy Vercel + configurar AdSense. **Próximo passo.**

### Estado do código (2026-07-14) — escopo v1 completo
Projeto real em `C:\Claude\SimulaCredito` (Next.js 16 + TS + Tailwind) — ver [[project_simulador_credito]] na memória pra detalhes técnicos (gotcha da API do BCB, estrutura de arquivos). `npm run lint` e `tsc --noEmit` passando limpos. As 4 páginas (`/credito-pessoal`, `/consignado`, `/financiamento-veiculo`, `/financiamento-imobiliario`) estão funcionando ponta a ponta com dado real do BCB, verificadas no browser.

## Riscos / decisões ainda em aberto

- Definir se a v1 mostra taxa por banco individual (tabela comparativa, mais rico pra SEO) ou só a média calculada — dado que a API não fornece essa média pronta, precisa decidir a fórmula (média simples das instituições retornadas, já que não há peso por volume disponível nesse nível).
- Decidir o padrão default de imobiliário (qual indexador/mercado-vs-regulada vem pré-selecionado) já que exige uma escolha a mais do usuário que as outras modalidades não têm.
