// Cliente mínimo da API do Mercado Pago (Pix) — pra confirmação de presença da festa.

async function criarPagamentoPix(env, { referenciaId, valor, descricao }) {
  const resp = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.MP_ACCESS_TOKEN,
      "Content-Type": "application/json",
      // Evita cobrar duas vezes se o convidado clicar duas vezes sem querer.
      "X-Idempotency-Key": referenciaId
    },
    body: JSON.stringify({
      transaction_amount: valor,
      description: descricao,
      payment_method_id: "pix",
      external_reference: referenciaId,
      payer: { email: "bday+" + referenciaId + "@arnaldohungria.github.io" } // MP exige e-mail do pagador; não coletamos e-mail do convidado. ".invalid" (RFC 2606) é rejeitado pela validação deles, por isso usamos um domínio real que não recebe e-mail de verdade.
    })
  });

  if (!resp.ok) throw new Error("Falha ao criar pagamento Pix no Mercado Pago (HTTP " + resp.status + " " + resp.statusText + "): " + (await resp.text()));

  const pagamento = await resp.json();
  const transactionData = pagamento.point_of_interaction?.transaction_data || {};

  return {
    id: String(pagamento.id),
    status: pagamento.status,
    pixCopiaECola: transactionData.qr_code || null,
    pixQrCodeBase64: transactionData.qr_code_base64 || null
  };
}

async function consultarPagamento(env, paymentId) {
  const resp = await fetch("https://api.mercadopago.com/v1/payments/" + paymentId, {
    headers: { Authorization: "Bearer " + env.MP_ACCESS_TOKEN }
  });

  if (!resp.ok) throw new Error("Falha ao consultar pagamento no Mercado Pago: " + (await resp.text()));
  return resp.json();
}

export { criarPagamentoPix, consultarPagamento };
