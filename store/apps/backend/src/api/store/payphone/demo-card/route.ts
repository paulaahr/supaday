import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { loadPayphoneSession } from "../../../../modules/payphone/load-session"

type DemoCardBody = {
  cart_id?: string
  cartId?: string
  last4?: string
  client_transaction_id?: string
  clientTransactionId?: string
}

export async function POST(
  req: MedusaRequest<DemoCardBody>,
  res: MedusaResponse
) {
  const cartId = req.body?.cart_id || req.body?.cartId
  const last4 = String(req.body?.last4 || "")
  const clientTransactionId = String(
    req.body?.client_transaction_id || req.body?.clientTransactionId || ""
  )

  if (!cartId || !/^\d{4}$/.test(last4) || !clientTransactionId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Faltan los datos de la tarjeta de demostración."
    )
  }

  const session = await loadPayphoneSession(req.scope, cartId)

  if (session.data?.demo !== true) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Esta caja de pagos solo guarda la tarjeta en modo demo."
    )
  }

  if (String(session.data.clientTransactionId || "") !== clientTransactionId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "La transacción no coincide con este carrito."
    )
  }

  const payment = req.scope.resolve(Modules.PAYMENT)
  await payment.updatePaymentSession({
    id: session.id,
    amount: session.amount as never,
    currency_code: session.currency_code,
    data: {
      ...session.data,
      lastDigits: last4,
      demoStatus: "approved",
    },
  })

  res.json({ ok: true })
}
