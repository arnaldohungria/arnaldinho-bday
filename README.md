# Arnaldinho B-Day 🎉

Site de convite pros 39 anos do Arnaldo — sábado, 19 de setembro de 2026, às 19h, numa chácara em Itapetininga-SP.

## O que tem

- **`index.html`** — página principal: contagem regressiva, texto do convite, fotos, detalhes da festa (endereço, piscina aquecida, janta de Strogonoff, contribuição de R$15/pessoa), localização.
- **`confirmar.html`** — formulário de confirmação de presença (sem cadastro/login): nome do convidado + até 5 acompanhantes (com checkbox de criança até 10 anos, isenta da taxa). Gera Pix automático via Mercado Pago pro valor calculado.
- **`app/login.html` + `app/lista.html`** — painel privado só do Arnaldo, com a lista de confirmações e o status de pagamento de cada uma.
- **`worker/`** — Cloudflare Worker que gera o Pix (Mercado Pago) e recebe o webhook de confirmação de pagamento, marcando automaticamente na lista.

## Infra

- Firebase: projeto `arnaldinho-bday` (Firestore + Auth, conta `arnaldo@live.jp`).
- Hospedagem: GitHub Pages, repositório `arnaldohungria/arnaldinho-bday`.
- Worker: Cloudflare, `arnaldinho-bday.academiaplus.workers.dev`.

Mesmo padrão usado no site do HOS Jiu-Jitsu (rifa/doações) — reserva/confirmação pública, painel de admin protegido por login, Pix automático com fallback gracioso enquanto os segredos do Worker não estão configurados.
