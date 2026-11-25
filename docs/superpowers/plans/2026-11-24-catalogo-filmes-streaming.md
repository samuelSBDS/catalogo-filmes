# Catálogo de Filmes em Streaming — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** site de navegador para buscar um filme e ver onde ele está no streaming no Brasil, e para navegar pelo catálogo de cada serviço.

**Arquitetura:** HTML, CSS e JavaScript puro com módulos ES, sem etapa de build. Um único módulo (`js/api.js`) fala com o TMDB. Localmente ele chama o TMDB direto, com a chave em `js/config.js`. Publicado, ele chama a função serverless `/api/tmdb` da Netlify, que guarda a chave. A lógica pura fica em `js/dados.js`, testada por uma página de testes no navegador.

**Tecnologias:** HTML5, CSS, JavaScript (ES modules), API TMDB v3, extensão Live Preview do VS Code e, só na Tarefa 6, Git, GitHub, Node, Netlify CLI e Netlify Functions.

**Spec:** [docs/superpowers/specs/2026-11-24-catalogo-filmes-streaming-design.md](../specs/2026-11-24-catalogo-filmes-streaming-design.md)

## Restrições globais

- Sem frameworks e sem build. Os arquivos abrem direto pelo Live Preview.
- Toda chamada ao TMDB usa `language=pt-BR`. As de "onde assistir" usam a região `BR`.
- Navegação: `with_watch_monetization_types=flatrate`, `sort_by=popularity.desc`.
- Serviços (IDs TMDB, conferir na Tarefa 1): Netflix `8`, Prime Video `119`, Disney+ `337`, Max `1899`, Globoplay `307`.
- Busca: "disponível" = qualquer provedor `flatrate` em `results.BR`. Sem nenhum, mostra o texto exato `Não está em streaming agora`.
- Rodapé em todas as páginas, com logo do TMDB, o texto `Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.` e `Dados de onde assistir: JustWatch`.
- Pôster: `https://image.tmdb.org/t/p/w342{poster_path}`.
- `js/config.js` nunca vai para o Git.
- **Público-alvo:** o autor é iniciante. Ao fim de cada tarefa, o executor explica em português simples o que foi escrito e por quê. Cada edição é feita arquivo a arquivo, para o autor acompanhar no editor e no Live Preview.
- Sem Git até a Tarefa 6. Os passos de commit das tarefas 1 a 5 são feitos todos de uma vez, no início da Tarefa 6.

## Foco da revisão

1. **Digitação rápida na busca:** resultados de uma busca antiga não podem sobrescrever os de uma busca mais nova. Teste na Tarefa 4.
2. **Chave inválida, sem internet ou TMDB fora do ar:** mostrar uma mensagem de erro amigável, e não uma tela vazia ou travada. Teste nas Tarefas 1 e 3.
3. **Filme sem pôster ou sem data:** mostrar uma imagem substituta e omitir o ano, sem `null`/`undefined` na tela. Teste na Tarefa 2.
4. **Última página do catálogo:** o botão "Carregar mais" some quando `page >= total_pages`. Teste na Tarefa 2.
5. **Busca vazia, só espaços ou com acentos e símbolos (`&`, `?`):** vazia não chama a API, e o resto é codificado corretamente na URL. Teste na Tarefa 2.

---

## Estrutura de arquivos

```
index.html            página principal: busca + navegação
filme.html            detalhe do filme (?id=123)
css/style.css         visual, responsivo
js/config.example.js  modelo da chave (vai pro Git)
js/config.js          chave real (fora do Git)
js/api.js             única porta de saída para o TMDB
js/dados.js           funções puras (formatação, filtros)
js/principal.js       lógica do index.html
js/detalhe.js         lógica do filme.html
testes/testes.html    roda os testes no navegador
testes/testes.js      testes de dados.js
netlify/functions/tmdb.mjs   (Tarefa 6) repasse com a chave
netlify.toml                 (Tarefa 6)
.gitignore                   (Tarefa 6)
```

---

### Tarefa 1: Ambiente, chave e conexão com o TMDB

**Arquivos:** criar `js/config.example.js`, `js/config.js`, `js/api.js`, `testes/testes.html` e `testes/testes.js`.

**Interfaces:**
- Produz: `tmdbGet(caminho: string, params?: Record<string,string|number>) => Promise<object>` em `js/api.js`. Lança `Error` com `mensagem` legível se a resposta não for ok ou se a rede falhar.
- Produz: `js/config.js` exporta `export const TMDB_TOKEN = "..."` (o "API Read Access Token" do TMDB).
- Produz: `testes/testes.js` define `teste(nome, fn)` e `igual(atual, esperado)`, e escreve ✅/❌ na página.

- [ ] **Passo 1:** guiar o autor a instalar a extensão **Live Preview** (ms-vscode.live-server) e abri-la na lateral.
- [ ] **Passo 2:** guiar o autor a criar conta no TMDB e copiar o *API Read Access Token*. O autor cola o token em `js/config.js`. O executor nunca lê nem imprime a chave.
- [ ] **Passo 3:** escrever `tmdbGet`. Tentar `import('./config.js')` dinâmico (uma vez só, guardando o resultado). Se ele carregar, usar `fetch('https://api.themoviedb.org/3' + caminho + '?' + URLSearchParams)` com o header `Authorization: Bearer <token>`. Se falhar (no site publicado o arquivo não existe), usar `fetch('/api/tmdb?caminho=' + encodeURIComponent(caminho) + '&' + params)`. Sempre acrescentar `language=pt-BR`.
- [ ] **Passo 4:** criar a página de testes com um teste de fumaça que chama `tmdbGet('/genre/movie/list')` e confere que `genres.length > 0`. Abrir `testes/testes.html` no Live Preview. Esperado: ✅.
- [ ] **Passo 5:** teste de erro. Com o token trocado por `"errado"`, o teste de fumaça mostra ❌ com uma mensagem legível, sem travar a página. Restaurar o token.
- [ ] **Passo 6:** chamar `/watch/providers/movie?watch_region=BR` e conferir os 5 IDs das Restrições globais. Se algum divergir, corrigir aqui e em `js/principal.js` depois.

### Tarefa 2: Funções puras (`js/dados.js`)

**Interfaces (todas exportadas de `js/dados.js`):**
- `urlPoster(posterPath: string|null) => string`: URL `w342`, ou `"img/sem-poster.svg"` se for nulo.
- `anoDe(releaseDate: string|undefined) => string`: `"2021"`, ou `""` se vazio ou ausente.
- `assinaturaBR(resultadoProviders: object) => Array<{id:number, nome:string, logo:string}>`: lê `results.BR.flatrate`, ou `[]`.
- `ondeAssistirBR(resultadoProviders) => {assinatura, aluguel, compra}`: os três arrays no mesmo formato acima, vindos de `flatrate`, `rent` e `buy`.
- `temMaisPaginas(page: number, totalPages: number) => boolean`.
- `termoValido(texto: string) => string|null`: retorna o texto sem espaços nas pontas, ou `null` se ficar vazio.

Criar também `img/sem-poster.svg`: um retângulo cinza com um ícone de filme.

- [ ] **Passo 1: escrever os testes que falham** em `testes/testes.js`:
```js
igual(urlPoster("/abc.jpg"), "https://image.tmdb.org/t/p/w342/abc.jpg");
igual(urlPoster(null), "img/sem-poster.svg");
igual(anoDe("2021-09-15"), "2021");
igual(anoDe(""), ""); igual(anoDe(undefined), "");
igual(assinaturaBR({results:{}}).length, 0);
igual(assinaturaBR({results:{BR:{flatrate:[{provider_id:8,provider_name:"Netflix",logo_path:"/n.png"}]}}})[0].nome, "Netflix");
igual(ondeAssistirBR({results:{BR:{rent:[{provider_id:2,provider_name:"Apple TV",logo_path:"/a.png"}]}}}).aluguel.length, 1);
igual(ondeAssistirBR({results:{}}).compra.length, 0);
igual(temMaisPaginas(3, 3), false); igual(temMaisPaginas(1, 3), true); igual(temMaisPaginas(1, 0), false);
igual(termoValido("   "), null); igual(termoValido("  duna "), "duna");
```
- [ ] **Passo 2:** abrir os testes. Esperado: ❌, porque as funções ainda não existem.
- [ ] **Passo 3:** implementar `js/dados.js`.
- [ ] **Passo 4:** abrir os testes. Esperado: todos ✅.

### Tarefa 3: Navegação pelo catálogo (`index.html`)

**Interfaces:**
- Consome: `tmdbGet` e os helpers da Tarefa 2.
- Produz: `index.html` com os elementos `#busca` (input), `#servicos` (botões com `data-id`), `#genero` (select), `#grade`, `#carregar-mais`, `#status` e `<footer>`. `js/principal.js` exporta `mostrarCartoes(filmes, {limpar:boolean})`, usado pela Tarefa 4.

- [ ] **Passo 1:** escrever `index.html`, `css/style.css` (grade responsiva: 2 colunas no celular e 4 ou mais a partir de 768px) e o rodapé com a atribuição exata das Restrições globais.
- [ ] **Passo 2:** carregar os gêneros de `/genre/movie/list` no `#genero`, com a primeira opção `Todos`.
- [ ] **Passo 3:** ao clicar num serviço (Netflix vem selecionado ao abrir), chamar `/discover/movie` com `with_watch_providers`, `watch_region=BR`, `with_watch_monetization_types=flatrate`, `sort_by=popularity.desc`, `with_genres` (omitido se for `Todos`) e `page`. Cada cartão mostra pôster, título e ano, e leva a `filme.html?id={id}`.
- [ ] **Passo 4:** "Carregar mais" busca `page+1` e acrescenta os cartões. O botão fica escondido quando `temMaisPaginas` for falso. Trocar de serviço ou de gênero volta para a página 1 e limpa a grade.
- [ ] **Passo 5:** estados em `#status`: `Carregando…`, `Nenhum filme encontrado.` e `Não foi possível carregar os filmes. Verifique sua conexão e tente de novo.`
- [ ] **Passo 6: verificar no Live Preview.** A Netflix mostra 20 pôsteres. "Carregar mais" mostra 40. Trocar para Max com o gênero Terror mostra só filmes de terror. Com a internet desligada no DevTools, aparece a mensagem de erro.

### Tarefa 4: Busca por título

**Interfaces:**
- Consome: `mostrarCartoes`, `assinaturaBR`, `termoValido` e `tmdbGet`.

- [ ] **Passo 1:** com a busca ativa, a área de serviços, gênero e grade é trocada por uma lista de resultados. Limpar o campo volta para a navegação.
- [ ] **Passo 2:** ao digitar, esperar 400 ms sem novas teclas (debounce). Se `termoValido` for `null`, não chamar a API. Se for válido, chamar `/search/movie?query=` e pegar os 10 primeiros resultados.
- [ ] **Passo 3:** para cada resultado, chamar `/movie/{id}/watch/providers` em paralelo (`Promise.all`). O item mostra pôster, título, ano e `Disponível em: Netflix · Max`, ou `Não está em streaming agora`.
- [ ] **Passo 4: proteção contra corrida.** Guardar um contador `buscaAtual` e, ao chegar uma resposta, descartá-la se o número dela não for o atual.
- [ ] **Passo 5: verificar.** `duna` mostra os filmes Duna com serviços. Digitar `a`, `ab`, `abc` rápido mostra só o resultado de `abc`. `   ` não faz requisição (aba Rede do DevTools). `velozes & furiosos` retorna resultados.

### Tarefa 5: Página do filme (`filme.html`)

**Interfaces:**
- Consome: `tmdbGet`, `urlPoster`, `anoDe` e `ondeAssistirBR`.

- [ ] **Passo 1:** `filme.html` lê `?id=` da URL. Se não houver id ou ele for inválido, mostrar `Filme não encontrado.` e um link para voltar.
- [ ] **Passo 2:** chamar `/movie/{id}` e `/movie/{id}/watch/providers` em paralelo e mostrar pôster, título, ano, sinopse (ou `Sinopse indisponível.`) e nota (`vote_average` com 1 casa decimal, ex. `7.8`).
- [ ] **Passo 3:** seção "Onde assistir" com três grupos (Assinatura, Aluguel, Compra) e logos (`https://image.tmdb.org/t/p/w92{logo_path}`). Grupos vazios não aparecem. Se os três estiverem vazios, mostrar `Não está disponível no Brasil agora.`
- [ ] **Passo 4:** link "← Voltar" e o mesmo rodapé.
- [ ] **Passo 5: verificar.** Clicar num cartão da Tarefa 3 abre o detalhe certo. `filme.html?id=abc` mostra `Filme não encontrado.`

### Tarefa 6: Git, GitHub e publicação na Netlify

Esta é a lição de instalação. O executor explica cada comando antes de rodá-lo.

**Arquivos:** criar `.gitignore` (contendo `js/config.js` e `node_modules/`), `netlify.toml` e `netlify/functions/tmdb.mjs`.

**Interfaces:**
- Produz: `GET /api/tmdb?caminho=<caminho>&<params>`, que repassa a requisição para `https://api.themoviedb.org/3<caminho>` com `Authorization: Bearer ${process.env.TMDB_TOKEN}` e devolve o JSON e o status.
- `netlify.toml`: `[[redirects]] from="/api/tmdb" to="/.netlify/functions/tmdb" status=200`.

- [ ] **Passo 1:** guiar a instalação do Git e do Node (LTS) e a criação da conta no GitHub. Conferir com `git --version` e `node --version`.
- [ ] **Passo 2:** `git init`, criar o `.gitignore`, rodar `git status` e **conferir que `js/config.js` não aparece**. Commit: `feat: catálogo de filmes (versão local)`.
- [ ] **Passo 3:** escrever a função com uma **lista de permissão** de caminhos. Aceitar só `/genre/movie/list`, `/discover/movie` e `/search/movie`, além de `^/movie/\d+$` e `^/movie/\d+/watch/providers$`. Qualquer outro caminho responde 403 `{"erro":"caminho não permitido"}`.
- [ ] **Passo 4:** `npm i -g netlify-cli`, depois `netlify dev` com `TMDB_TOKEN` num arquivo `.env` (também no `.gitignore`). Verificar que `/api/tmdb?caminho=/genre/movie/list` devolve os gêneros, que `/api/tmdb?caminho=/account` devolve 403 e que o site funciona em `localhost:8888`. Para testar o site inteiro via proxy, renomear `js/config.js` temporariamente e recarregar. Tudo deve continuar funcionando. Depois, voltar o nome original.
- [ ] **Passo 5:** criar o repositório no GitHub e rodar `git push`. Na Netlify: "Import from Git", definir a variável de ambiente `TMDB_TOKEN` e publicar.
- [ ] **Passo 6: verificar no site publicado.** Navegação, busca e detalhe funcionam. No DevTools, a aba Rede mostra chamadas só para `/api/tmdb`, e o token não aparece em nenhum arquivo servido.
- [ ] **Passo 7:** commit e push das mudanças da tarefa: `feat: publicação na Netlify com proxy`.
