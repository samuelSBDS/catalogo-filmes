// principal.js — controla a página inicial: navegação pelo catálogo e busca.
import { tmdbGet } from "./api.js";
import { urlPoster, anoDe, assinaturaBR, temMaisPaginas, termoValido } from "./dados.js";

// ---------- Elementos da página ----------
const campoBusca = document.getElementById("busca");
const navegacao = document.getElementById("navegacao");
const botoesServico = document.querySelectorAll("#servicos button");
const seletorGenero = document.getElementById("genero");
const grade = document.getElementById("grade");
const botaoMais = document.getElementById("carregar-mais");
const secaoBusca = document.getElementById("resultados-busca");
const listaBusca = document.getElementById("lista-busca");
const status = document.getElementById("status");

const MSG_ERRO = "Não foi possível carregar os filmes. Verifique sua conexão e tente de novo.";

// ---------- Estado da navegação ----------
let servicoAtual = "8";   // Netflix começa selecionada
let generoAtual = "";     // "" = Todos
let paginaAtual = 0;
let pedidoNavegacao = 0;  // contador para descartar respostas antigas

// ---------- Utilidades de tela ----------
// Criamos os elementos com createElement + textContent (e não com innerHTML),
// assim um título com caracteres estranhos nunca "quebra" a página.
function criarCartao(filme) {
  const link = document.createElement("a");
  link.className = "cartao";
  link.href = `filme.html?id=${filme.id}`;

  const img = document.createElement("img");
  img.src = urlPoster(filme.poster_path);
  img.alt = filme.title;
  img.loading = "lazy";

  const info = document.createElement("div");
  info.className = "info";
  const titulo = document.createElement("h3");
  titulo.textContent = filme.title;
  const ano = document.createElement("span");
  ano.className = "ano";
  ano.textContent = anoDe(filme.release_date);
  info.append(titulo, ano);

  link.append(img, info);
  return link;
}

function mostrarCartoes(filmes, { limpar }) {
  if (limpar) grade.replaceChildren();
  grade.append(...filmes.map(criarCartao));
}

// ---------- Navegação ----------
async function carregarPagina({ limpar }) {
  const meuPedido = ++pedidoNavegacao;
  const pagina = limpar ? 1 : paginaAtual + 1;
  if (limpar) { grade.replaceChildren(); botaoMais.hidden = true; }
  status.textContent = "Carregando…";
  botaoMais.disabled = true;

  const params = {
    with_watch_providers: servicoAtual,
    watch_region: "BR",
    with_watch_monetization_types: "flatrate",
    sort_by: "popularity.desc",
    page: pagina,
  };
  if (generoAtual) params.with_genres = generoAtual;

  try {
    const dados = await tmdbGet("/discover/movie", params);
    if (meuPedido !== pedidoNavegacao) return; // o usuário já trocou de filtro
    paginaAtual = pagina;
    mostrarCartoes(dados.results, { limpar });
    status.textContent = grade.children.length === 0 ? "Nenhum filme encontrado." : "";
    botaoMais.hidden = !temMaisPaginas(dados.page, dados.total_pages);
  } catch (erro) {
    if (meuPedido !== pedidoNavegacao) return;
    console.error(erro);
    status.textContent = MSG_ERRO;
  } finally {
    botaoMais.disabled = false;
  }
}

async function carregarGeneros() {
  try {
    const dados = await tmdbGet("/genre/movie/list");
    for (const g of dados.genres) {
      const opcao = document.createElement("option");
      opcao.value = g.id;
      opcao.textContent = g.name;
      seletorGenero.append(opcao);
    }
  } catch (erro) {
    console.error(erro); // sem gêneros, o filtro fica só com "Todos"
  }
}

botoesServico.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesServico.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    servicoAtual = botao.dataset.id;
    carregarPagina({ limpar: true });
  });
});

seletorGenero.addEventListener("change", () => {
  generoAtual = seletorGenero.value;
  carregarPagina({ limpar: true });
});

botaoMais.addEventListener("click", () => carregarPagina({ limpar: false }));

// ---------- Busca ----------
let esperaDigitacao = null;
let buscaAtual = 0; // contador: só a resposta da busca mais recente aparece

function nomesDosServicos(providers) {
  const lista = assinaturaBR(providers);
  return lista.length ? `Disponível em: ${lista.map((p) => p.nome).join(" · ")}` : "Não está em streaming agora";
}

function criarItemBusca(filme, textoOnde) {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = `filme.html?id=${filme.id}`;

  const img = document.createElement("img");
  img.src = urlPoster(filme.poster_path);
  img.alt = filme.title;

  const texto = document.createElement("div");
  const titulo = document.createElement("h3");
  const ano = anoDe(filme.release_date);
  titulo.textContent = ano ? `${filme.title} (${ano})` : filme.title;
  const onde = document.createElement("p");
  onde.className = "onde";
  onde.textContent = textoOnde;
  texto.append(titulo, onde);

  link.append(img, texto);
  li.append(link);
  return li;
}

function modoBusca(ativo) {
  navegacao.hidden = ativo;
  secaoBusca.hidden = !ativo;
  if (!ativo) { listaBusca.replaceChildren(); status.textContent = ""; }
}

async function buscar(termo) {
  const minhaBusca = ++buscaAtual;
  modoBusca(true);
  listaBusca.replaceChildren();
  status.textContent = "Carregando…";

  try {
    const dados = await tmdbGet("/search/movie", { query: termo });
    const filmes = dados.results.slice(0, 10);
    // Pergunta "onde assistir" de cada filme ao mesmo tempo (em paralelo)
    const providers = await Promise.all(
      filmes.map((f) => tmdbGet(`/movie/${f.id}/watch/providers`).catch(() => null))
    );
    if (minhaBusca !== buscaAtual) return; // chegou atrasada: ignorar
    listaBusca.replaceChildren(...filmes.map((f, i) => criarItemBusca(f, nomesDosServicos(providers[i]))));
    status.textContent = filmes.length ? "" : "Nenhum filme encontrado.";
  } catch (erro) {
    if (minhaBusca !== buscaAtual) return;
    console.error(erro);
    status.textContent = MSG_ERRO;
  }
}

campoBusca.addEventListener("input", () => {
  clearTimeout(esperaDigitacao);
  const termo = termoValido(campoBusca.value);
  if (termo === null) {
    buscaAtual++;          // cancela qualquer busca em andamento
    modoBusca(false);
    if (grade.children.length === 0) carregarPagina({ limpar: true });
    return;
  }
  esperaDigitacao = setTimeout(() => buscar(termo), 400);
});

// ---------- Início ----------
carregarGeneros();
carregarPagina({ limpar: true });
