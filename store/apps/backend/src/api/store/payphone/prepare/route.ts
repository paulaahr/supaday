import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { loadPayphoneSession } from "../../../../modules/payphone/load-session"

type PrepareBody = {
  cart_id?: string
  cartId?: string
  country_code?: string
  countryCode?: string
}

export async function POST(
  req: MedusaRequest<PrepareBody>,
  res: MedusaResponse
) {
  const cartId = req.body?.cart_id || req.body?.cartId
  const countryCode = (
    req.body?.country_code ||
    req.body?.countryCode ||
    "ec"
  ).toLowerCase()

  if (!cartId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Falta el carrito para preparar el pago."
    )
  }

  const session = await loadPayphoneSession(req.scope, cartId)
  const payment = req.scope.resolve(Modules.PAYMENT)
  const updated = await payment.updatePaymentSession({
    id: session.id,
    amount: session.amount as never,
    currency_code: session.currency_code,
    data: {
      ...session.data,
      intent: "prepare",
      cart_id: cartId,
      country_code: countryCode,
      email: session.email,
      phone: session.phone,
    },
  })

  const payUrl = updated.data?.payUrl

  if (typeof payUrl !== "string" || !payUrl) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Payphone no devolvió una página de pago."
    )
  }

  res.json({
    payUrl,
    demo: updated.data?.demo === true,
    clientTransactionId: updated.data?.clientTransactionId,
  })
}
