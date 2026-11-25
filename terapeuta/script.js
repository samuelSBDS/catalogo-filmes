// ===== CONFIGURAÇÃO =====
// Coloque aqui o número de WhatsApp (código do país + DDD + número, só dígitos)
const WHATSAPP = "5500000000000";

// ===== MENU MOBILE =====
const menuBotao = document.querySelector(".menu-botao");
const menu = document.querySelector("#menu");

menuBotao.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  menuBotao.setAttribute("aria-expanded", aberto);
  menuBotao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});

// Fecha o menu ao clicar em um link
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("aberto");
    menuBotao.setAttribute("aria-expanded", "false");
    menuBotao.setAttribute("aria-label", "Abrir menu");
  });
});

// ===== MÁSCARA DE TELEFONE =====
const telefone = document.querySelector("#telefone");

telefone.addEventListener("input", () => {
  let n = telefone.value.replace(/\D/g, "").slice(0, 11);
  if (n.length > 6) n = `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  else if (n.length > 2) n = `(${n.slice(0, 2)}) ${n.slice(2)}`;
  else if (n.length > 0) n = `(${n}`;
  telefone.value = n;
});

// ===== FORMULÁRIO → ABRE O WHATSAPP COM A MENSAGEM PRONTA =====
const formulario = document.querySelector("#formulario");
const aviso = document.querySelector("#aviso");

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nome = formulario.nome.value.trim();
  const tel = formulario.telefone.value.replace(/\D/g, "");
  const modalidade = formulario.modalidade.value;
  const mensagem = formulario.mensagem.value.trim();

  formulario.nome.classList.toggle("invalido", nome.length < 2);
  formulario.telefone.classList.toggle("invalido", tel.length < 10);

  if (nome.length < 2 || tel.length < 10) {
    aviso.textContent = "Por favor, preencha seu nome e um telefone válido.";
    aviso.className = "formulario__aviso erro";
    return;
  }

  const texto =
    `Olá! Meu nome é ${nome}.\n` +
    `Gostaria de agendar uma sessão (${modalidade}).\n` +
    `Telefone: ${formulario.telefone.value}` +
    (mensagem ? `\n\n${mensagem}` : "");

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");

  aviso.textContent = "Obrigada! Sua mensagem foi preparada no WhatsApp.";
  aviso.className = "formulario__aviso sucesso";
  formulario.reset();
});

// ===== ANIMAÇÃO AO ROLAR A PÁGINA =====
const elementos = document.querySelectorAll(".secao h2, .card, .passos li, .sobre__texto, .formulario");
elementos.forEach((el) => el.classList.add("aparecer"));

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visivel");
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });

elementos.forEach((el) => observador.observe(el));

// ===== ANO NO RODAPÉ =====
document.querySelector("#ano").textContent = new Date().getFullYear();
