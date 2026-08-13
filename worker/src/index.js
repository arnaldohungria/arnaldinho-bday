import { patchDocument, getDocument } from "./firestore.js";
import { criarPagamentoPix, consultarPagamento } from "./mercadopago.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

function credenciaisFaltando(env) {
  const faltando = ["MP_ACCESS_TOKEN", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"].filter((k) => !env[k]);
  return faltando.length ? faltando : null;
}

async function handleCriarPix(request, env) {
  const faltando = credenciaisFaltando(env);
  if (faltando) {
    return json({ erro: "Worker ainda não configurado. Faltam os segredos: " + faltando.join(", ") }, 501);
  }

  const body = await request.json();
  const { confirmacaoId, valor, descricao } = body;

  if (!confirmacaoId || !valor || valor <= 0 || !descricao) {
    return json({ erro: "Campos obrigatórios: confirmacaoId, valor, descricao." }, 400);
  }

  const confirmacao = await getDocument(env, "confirmacoes/" + confirmacaoId);
  if (!confirmacao) return json({ erro: "Confirmação não encontrada." }, 404);
  if (confirmacao.status !== "pendente") return json({ erro: "Confirmação já não está mais pendente." }, 409);

  const pagamento = await criarPagamentoPix(env, { referenciaId: confirmacaoId, valor, descricao });

  await patchDocument(env, "confirmacoes/" + confirmacaoId, {
    pixCopiaECola: pagamento.pixCopiaECola,
    pixQrCodeBase64: pagamento.pixQrCodeBase64,
    mpPaymentId: pagamento.id
  });

  return json({ ok: true, pixCopiaECola: pagamento.pixCopiaECola, pixQrCodeBase64: pagamento.pixQrCodeBase64 });
}

async function handleWebhookMercadoPago(request, env) {
  const faltando = credenciaisFaltando(env);
  if (faltando) return json({ erro: "Worker ainda não configurado." }, 501);

  const url = new URL(request.url);
  let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

  if (!paymentId) {
    const body = await request.json().catch(() => ({}));
    paymentId = body?.data?.id;
  }

  if (!paymentId) return json({ ok: true }); // notificação que não é de pagamento; só confirma recebimento

  // Nunca confia no conteúdo da notificação em si — sempre confirma o status direto na API do Mercado Pago.
  // Notificações de teste do próprio painel do Mercado Pago costumam usar um ID que não existe de
  // verdade — trata como "nada a fazer" em vez de devolver erro (evita retentativa em loop).
  let pagamento;
  try {
    pagamento = await consultarPagamento(env, paymentId);
  } catch (err) {
    return json({ ok: true });
  }
  if (pagamento.status !== "approved") return json({ ok: true });

  const confirmacaoId = pagamento.external_reference;
  if (!confirmacaoId) return json({ ok: true });

  const confirmacao = await getDocument(env, "confirmacoes/" + confirmacaoId);
  if (!confirmacao || confirmacao.status === "pago") return json({ ok: true }); // já processado ou não existe (idempotência)

  await patchDocument(env, "confirmacoes/" + confirmacaoId, { status: "pago", pagoEm: new Date() });

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const { pathname } = new URL(request.url);

    try {
      if (pathname === "/criar-pix" && request.method === "POST") {
        return await handleCriarPix(request, env);
      }
      if (pathname === "/webhook-mercadopago" && request.method === "POST") {
        return await handleWebhookMercadoPago(request, env);
      }
      if (pathname === "/" && request.method === "GET") {
        return json({ status: "ok", service: "arnaldinho-bday" });
      }
      return json({ erro: "Rota não encontrada." }, 404);
    } catch (err) {
      return json({ erro: String(err.message || err) }, 500);
    }
  }
};
