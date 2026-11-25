// api.js — a única "porta de saída" do site para o TMDB.
// Todas as outras partes do código pedem dados chamando tmdbGet().

const BASE_TMDB = "https://api.themoviedb.org/3";

// Guardamos a tentativa de carregar config.js para fazer isso só uma vez.
// - No seu computador: config.js existe → falamos direto com o TMDB.
// - No site publicado: config.js não existe → usamos o nosso repasse /api/tmdb.
let configPromise = null;
function carregarConfig() {
  if (!configPromise) {
    configPromise = import("./config.js").catch(() => null);
  }
  return configPromise;
}

/**
 * Busca dados no TMDB.
 * @param {string} caminho  ex.: "/search/movie"
 * @param {Record<string,string|number>} [params]  ex.: { query: "duna" }
 * @returns {Promise<object>} o JSON devolvido pelo TMDB
 */
export async function tmdbGet(caminho, params = {}) {
  const busca = new URLSearchParams({ language: "pt-BR", ...params });
  const config = await carregarConfig();

  let url, opcoes;
  if (config) {
    url = `${BASE_TMDB}${caminho}?${busca}`;
    opcoes = { headers: { Authorization: `Bearer ${config.TMDB_TOKEN}` } };
  } else {
    busca.set("caminho", caminho);
    url = `/api/tmdb?${busca}`;
    opcoes = {};
  }

  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch {
    throw new Error("Sem conexão com a internet ou com o TMDB.");
  }
  if (!resposta.ok) {
    const motivo = resposta.status === 401 ? "chave do TMDB inválida" : `erro ${resposta.status}`;
    throw new Error(`O TMDB recusou o pedido (${motivo}).`);
  }
  return resposta.json();
}
