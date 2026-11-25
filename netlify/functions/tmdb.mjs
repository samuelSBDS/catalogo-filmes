// Função serverless: roda no servidor da Netlify, nunca no navegador.
// Ela recebe o pedido do site, acrescenta a chave secreta e repassa ao TMDB.
// Assim a chave fica guardada na Netlify (variável TMDB_TOKEN) e ninguém a vê.

const BASE_TMDB = "https://api.themoviedb.org/3";

// Só estes caminhos podem passar. Qualquer outro é recusado,
// para que ninguém use o nosso repasse para gastar a chave com outras coisas.
const PERMITIDOS = [
  /^\/genre\/movie\/list$/,
  /^\/discover\/movie$/,
  /^\/search\/movie$/,
  /^\/movie\/\d+$/,
  /^\/movie\/\d+\/watch\/providers$/,
];

export function caminhoPermitido(caminho) {
  return typeof caminho === "string" && PERMITIDOS.some((regra) => regra.test(caminho));
}

export default async (request) => {
  const url = new URL(request.url);
  const caminho = url.searchParams.get("caminho");

  if (!caminhoPermitido(caminho)) {
    return Response.json({ erro: "caminho não permitido" }, { status: 403 });
  }

  url.searchParams.delete("caminho");
  const resposta = await fetch(`${BASE_TMDB}${caminho}?${url.searchParams}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
  });

  return new Response(await resposta.text(), {
    status: resposta.status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
