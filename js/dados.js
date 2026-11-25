// dados.js — funções "puras": recebem dados e devolvem dados,
// sem tocar na tela nem na internet. Por isso são fáceis de testar.

const BASE_IMAGEM = "https://image.tmdb.org/t/p/";
export const POSTER_PADRAO = "img/sem-poster.svg";

/** Endereço do pôster em tamanho médio, ou a imagem substituta. */
export function urlPoster(posterPath) {
  return posterPath ? `${BASE_IMAGEM}w342${posterPath}` : POSTER_PADRAO;
}

/** Endereço do logo pequeno de um serviço. */
export function urlLogo(logoPath) {
  return `${BASE_IMAGEM}w92${logoPath}`;
}

/** "2021-09-15" → "2021". Vazio ou ausente → "". */
export function anoDe(releaseDate) {
  return releaseDate ? releaseDate.slice(0, 4) : "";
}

// Converte o formato do TMDB para um formato mais simples, só com o que usamos.
function simplificar(lista) {
  return (lista || []).map((p) => ({ id: p.provider_id, nome: p.provider_name, logo: p.logo_path }));
}

/** Serviços de assinatura (flatrate) no Brasil. */
export function assinaturaBR(resultadoProviders) {
  return simplificar(resultadoProviders?.results?.BR?.flatrate);
}

/** Assinatura, aluguel e compra no Brasil, separados. */
export function ondeAssistirBR(resultadoProviders) {
  const br = resultadoProviders?.results?.BR || {};
  return {
    assinatura: simplificar(br.flatrate),
    aluguel: simplificar(br.rent),
    compra: simplificar(br.buy),
  };
}

/** Ainda há outra página para carregar? */
export function temMaisPaginas(page, totalPages) {
  return page < totalPages;
}

/** Texto da busca sem espaços nas pontas, ou null se ficar vazio. */
export function termoValido(texto) {
  const limpo = (texto || "").trim();
  return limpo === "" ? null : limpo;
}
