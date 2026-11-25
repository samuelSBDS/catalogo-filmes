// Um mini "testador" feito à mão: cada teste vira uma linha ✅ ou ❌ na página.
import { tmdbGet } from "../js/api.js";

const lista = document.getElementById("resultados");
let passou = 0, falhou = 0;

function igual(atual, esperado) {
  if (atual !== esperado) {
    throw new Error(`esperado ${JSON.stringify(esperado)}, veio ${JSON.stringify(atual)}`);
  }
}

async function teste(nome, fn) {
  const li = document.createElement("li");
  try {
    await fn();
    li.textContent = `✅ ${nome}`;
    passou++;
  } catch (erro) {
    li.textContent = `❌ ${nome} — ${erro.message}`;
    falhou++;
  }
  lista.appendChild(li);
}

// ---------- Tarefa 1: conexão com o TMDB ----------
await teste("conexão: lista de gêneros chega do TMDB", async () => {
  const dados = await tmdbGet("/genre/movie/list");
  if (!(dados.genres.length > 0)) throw new Error("nenhum gênero veio");
});

// ---------- Tarefa 2: funções puras ----------
let d = null;
try {
  d = await import("../js/dados.js");
} catch {
  await teste("dados.js existe", () => { throw new Error("arquivo js/dados.js não encontrado"); });
}

if (d) {
  await teste("urlPoster com caminho", () => igual(d.urlPoster("/abc.jpg"), "https://image.tmdb.org/t/p/w342/abc.jpg"));
  await teste("urlPoster sem pôster", () => igual(d.urlPoster(null), "img/sem-poster.svg"));
  await teste("anoDe com data", () => igual(d.anoDe("2021-09-15"), "2021"));
  await teste("anoDe vazio", () => igual(d.anoDe(""), ""));
  await teste("anoDe ausente", () => igual(d.anoDe(undefined), ""));
  await teste("assinaturaBR sem Brasil", () => igual(d.assinaturaBR({ results: {} }).length, 0));
  await teste("assinaturaBR com Netflix", () => igual(
    d.assinaturaBR({ results: { BR: { flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.png" }] } } })[0].nome,
    "Netflix"));
  await teste("ondeAssistirBR aluguel", () => igual(
    d.ondeAssistirBR({ results: { BR: { rent: [{ provider_id: 2, provider_name: "Apple TV", logo_path: "/a.png" }] } } }).aluguel.length, 1));
  await teste("ondeAssistirBR sem Brasil", () => igual(d.ondeAssistirBR({ results: {} }).compra.length, 0));
  await teste("temMaisPaginas última página", () => igual(d.temMaisPaginas(3, 3), false));
  await teste("temMaisPaginas meio", () => igual(d.temMaisPaginas(1, 3), true));
  await teste("temMaisPaginas zero resultados", () => igual(d.temMaisPaginas(1, 0), false));
  await teste("termoValido só espaços", () => igual(d.termoValido("   "), null));
  await teste("termoValido apara espaços", () => igual(d.termoValido("  duna "), "duna"));
}

document.getElementById("resumo").textContent =
  falhou === 0 ? `Tudo certo: ${passou} de ${passou} passaram.` : `${falhou} falharam, ${passou} passaram.`;
