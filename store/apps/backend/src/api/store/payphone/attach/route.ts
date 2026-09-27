import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { loadPayphoneSession } from "../../../../modules/payphone/load-session"

type AttachBody = {
  cart_id?: string
  cartId?: string
  payphone_id?: string | number
  payphoneId?: string | number
  client_transaction_id?: string
  clientTransactionId?: string
}

export async function POST(
  req: MedusaRequest<AttachBody>,
  res: MedusaResponse
) {
  const cartId = req.body?.cart_id || req.body?.cartId
  const payphoneId = String(
    req.body?.payphone_id || req.body?.payphoneId || ""
  )
  const clientTransactionId = String(
    req.body?.client_transaction_id || req.body?.clientTransactionId || ""
  )

  if (!cartId || !/^\d+$/.test(payphoneId) || !clientTransactionId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "La respuesta de Payphone no incluye id y clientTransactionId."
    )
  }

  const session = await loadPayphoneSession(req.scope, cartId)
  const expected = String(session.data?.clientTransactionId || "")

  if (!expected || expected !== clientTransactionId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "La transacción de Payphone no coincide con este carrito."
    )
  }

  const payment = req.scope.resolve(Modules.PAYMENT)
  await payment.updatePaymentSession({
    id: session.id,
    amount: session.amount as never,
    currency_code: session.currency_code,
    data: {
      ...session.data,
      intent: "attach",
      payphoneTransactionId: Number(payphoneId),
      clientTransactionId,
    },
  })

  res.json({ ok: true })
}
