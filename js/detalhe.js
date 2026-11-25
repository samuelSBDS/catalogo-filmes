// detalhe.js — controla a página de um filme (filme.html?id=123).
import { tmdbGet } from "./api.js";
import { urlPoster, urlLogo, anoDe, ondeAssistirBR } from "./dados.js";

const conteudo = document.getElementById("conteudo");
const status = document.getElementById("status");

function criar(tag, texto, classe) {
  const el = document.createElement(tag);
  if (texto) el.textContent = texto;
  if (classe) el.className = classe;
  return el;
}

function grupoServicos(titulo, lista) {
  const grupo = criar("div", null, "grupo");
  grupo.append(criar("h4", titulo));
  const logos = criar("div", null, "logos");
  for (const p of lista) {
    const img = document.createElement("img");
    img.src = urlLogo(p.logo);
    img.alt = p.nome;
    img.title = p.nome;
    logos.append(img);
  }
  grupo.append(logos);
  return grupo;
}

async function iniciar() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id || !/^\d+$/.test(id)) {
    status.textContent = "Filme não encontrado.";
    return;
  }

  try {
    const [filme, providers] = await Promise.all([
      tmdbGet(`/movie/${id}`),
      tmdbGet(`/movie/${id}/watch/providers`),
    ]);

    document.title = `${filme.title} — Onde Assistir`;
    const ano = anoDe(filme.release_date);

    const detalhe = criar("div", null, "detalhe");
    const poster = document.createElement("img");
    poster.src = urlPoster(filme.poster_path);
    poster.alt = filme.title;

    const texto = criar("div", null, "texto");
    texto.append(criar("h2", ano ? `${filme.title} (${ano})` : filme.title));
    if (filme.vote_count > 0) {
      texto.append(criar("p", `★ ${filme.vote_average.toFixed(1)}`, "nota"));
    }
    texto.append(criar("p", filme.overview || "Sinopse indisponível."));

    texto.append(criar("h3", "Onde assistir"));
    const onde = ondeAssistirBR(providers);
    const grupos = [["Assinatura", onde.assinatura], ["Aluguel", onde.aluguel], ["Compra", onde.compra]]
      .filter(([, lista]) => lista.length > 0);
    if (grupos.length === 0) {
      texto.append(criar("p", "Não está disponível no Brasil agora."));
    } else {
      for (const [titulo, lista] of grupos) texto.append(grupoServicos(titulo, lista));
    }

    detalhe.append(poster, texto);
    conteudo.replaceChildren(detalhe);
    status.textContent = "";
  } catch (erro) {
    console.error(erro);
    // O TMDB devolve 404 para ids que não existem
    status.textContent = String(erro.message).includes("404")
      ? "Filme não encontrado."
      : "Não foi possível carregar o filme. Verifique sua conexão e tente de novo.";
  }
}

iniciar();
