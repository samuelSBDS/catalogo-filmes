# Catálogo de Filmes em Streaming — Design

Data: 2026-11-24

## Intenção e o porquê

Um site, aberto no navegador, que mostra quais filmes estão disponíveis nos serviços de streaming agora, usando a API do TMDB.

É o **primeiro projeto de programação** do autor, que está programando pela primeira vez. O objetivo principal é **aprender e conseguir terminar**. O uso principal é pessoal: o autor quer encontrar um filme específico e saber onde assisti-lo, e também explorar o que cada serviço tem.

## Objetivos

1. **Buscar:** digitar o nome de um filme e ver em quais streamings ele está disponível agora, no Brasil.
2. **Navegar:** escolher um serviço de streaming e ver os filmes dele em grade, ordenados por popularidade, com filtro de gênero e botão "Carregar mais".
3. **Detalhe:** ao clicar num filme, ver pôster, título, ano, sinopse, nota e onde assistir.
4. Código simples o bastante para um iniciante entender cada linha.

## Fora do escopo (por enquanto)

- Outros países além do Brasil.
- Séries de TV (só filmes).
- Contas de usuário, favoritos, listas e login.
- Banco de dados próprio ou cópia local do catálogo.
- Ver vários serviços ao mesmo tempo na navegação.
- Filtros além de gênero (ano, nota, idioma). Podem entrar depois, se o autor pedir.
- Links diretos para o filme dentro da Netflix, Prime etc. (o TMDB não fornece).

## Anti-objetivos (o projeto falha se...)

- Ficar tão complexo, com ferramentas, frameworks ou etapas de build demais, que o autor trave ou não entenda o próprio código.
- A chave da API ficar exposta publicamente no site publicado.
- Não ser terminado. É melhor uma versão pequena funcionando do que uma grande pela metade.

## Restrições

- **Fonte de dados:** API do TMDB v3 (https://developer.themoviedb.org/docs/getting-started). O autor precisa criar conta e chave.
- **Atribuição obrigatória:** exibir o crédito ao TMDB (logo e aviso de que o produto não é endossado pelo TMDB) e ao JustWatch, que fornece os dados de "onde assistir".
- **Região:** `watch_region=BR`, `language=pt-BR`.
- **Limite da API:** o `discover` devolve no máximo 500 páginas por consulta. Isso não é problema com "Carregar mais".
- **Sem etapa de build:** os arquivos rodam direto no navegador.

## Abordagens consideradas

| Abordagem | Prós | Contras |
|---|---|---|
| **A) HTML + CSS + JavaScript puro + função serverless (escolhida)** | Ensina a base. Quase nada fica "mágico". Sem instalação para começar. | Atualizar a tela dá mais trabalho manual e o código fica menos organizado conforme cresce. |
| B) React + Vite | Organiza a tela em componentes e é muito usado no mercado. | Obriga a aprender JS e React juntos, além de Node e terminal desde o dia 1. |
| C) Next.js | Servidor embutido resolve a chave escondida. | Conceitos demais para um primeiro projeto. |

**Escolha do autor: A.** O motivo é o objetivo de aprender e terminar. Reescrever em React fica como possível segundo projeto.

## Decisões tomadas

**Pelo autor:**
- Site de navegador, e não app de celular.
- Busca por título e navegação pelo catálogo, as duas funções.
- Abordagem A.
- Aceitou as propostas de navegação: um serviço por vez, ordenação por popularidade, filtro de gênero, "Carregar mais" e página de detalhe. Ele pode pedir mudanças depois.

**Propostas do assistente (aceitas implicitamente, podem ser revistas):**
- Começar só com o Brasil.
- Serviços iniciais: Netflix, Prime Video, Disney+, Max e Globoplay. Os IDs devem ser obtidos em `/watch/providers/movie?watch_region=BR`.
- Contar como "disponível" apenas assinatura (`flatrate`) na navegação. Na página de detalhe, mostrar também aluguel e compra, separados.
- Na busca, o filme é "disponível" se tiver qualquer serviço de assinatura (`flatrate`) no BR, inclusive fora dos 5 da navegação. Sem nenhum, mostra "Não está em streaming agora".
- A função `/api/tmdb` aceita só os endpoints listados abaixo, para não virar um repasse aberto que gasta a chave.

## Como o trabalho acontece (decidido pelo autor)

- **O assistente escreve o código** e explica cada parte depois de escrever, em linguagem simples para iniciante.
- **Acompanhamento ao vivo:** o autor quer ver o código sendo construído em tempo real, numa janela lateral. As edições aparecem no editor do VS Code conforme são feitas. Para ver o site atualizando ao lado, usa-se a extensão **Live Preview** (Microsoft) do VS Code, aberta numa aba lateral. Ela deve ser configurada logo no primeiro passo do plano.
- **Instalações:** o autor aceita instalar Git, Node e uma conta no GitHub e usar o terminal. Isso fica para a **etapa final** (publicação), como lição própria, depois que o site já funcionar localmente.

## Como funciona (visão geral)

```
Navegador (HTML/CSS/JS)  →  Função serverless (/api/tmdb)  →  API do TMDB
                              (guarda a chave em variável de ambiente)
```

Endpoints do TMDB usados:
- Busca: `GET /search/movie?query=...&language=pt-BR`
- Onde assistir: `GET /movie/{id}/watch/providers`, lendo `results.BR`
- Navegação: `GET /discover/movie?with_watch_providers={id}&watch_region=BR&with_watch_monetization_types=flatrate&with_genres={g}&sort_by=popularity.desc&page={n}`
- Gêneros: `GET /genre/movie/list?language=pt-BR`
- Detalhe: `GET /movie/{id}?language=pt-BR`
- Imagens: `https://image.tmdb.org/t/p/w342{poster_path}`

Telas:
1. **Início/Navegar:** campo de busca, botões de serviço, seletor de gênero, grade de pôsteres e "Carregar mais".
2. **Resultados da busca:** lista com pôster, título, ano e os serviços onde está disponível (ou "Não está em streaming agora").
3. **Detalhe do filme:** pôster, sinopse, ano, nota e onde assistir.
4. **Rodapé fixo** com as atribuições ao TMDB e ao JustWatch.

Estados a tratar: carregando, nenhum resultado, erro de rede/API e filme sem pôster.

## Desenvolvimento local e publicação

- **Local:** durante o aprendizado, o JS pode chamar o TMDB direto, com a chave num arquivo `config.js` fora do controle de versão. É o caminho mais simples para começar.
- **Publicado:** hospedagem grátis na Netlify ou Vercel. Uma função serverless repassa os pedidos ao TMDB e a chave fica em variável de ambiente. O front passa a chamar `/api/tmdb`.

## Deixado para quem for construir

- Estrutura de arquivos e nomes.
- Visual (cores, fontes, layout responsivo), desde que funcione bem no celular e no computador.
- Escolha entre Netlify e Vercel.
- Como organizar as telas: páginas HTML separadas ou uma só página com seções.
- Ritmo didático: o plano deve ser dividido em passos pequenos, cada um com resultado visível, e explicar os conceitos novos à medida que aparecem.
