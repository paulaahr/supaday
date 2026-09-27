import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

export const PAYPHONE_PROVIDER_ID = "pp_payphone_payphone"

export type PayphoneCartSession = {
  id: string
  provider_id: string
  amount: unknown
  currency_code: string
  status?: string
  data: Record<string, unknown>
  email?: string
  phone?: string
}

export const loadPayphoneSession = async (
  scope: MedusaContainer,
  cartId: string
): Promise<PayphoneCartSession> => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "email",
      "shipping_address.phone",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.amount",
      "payment_collection.payment_sessions.currency_code",
      "payment_collection.payment_sessions.status",
      "payment_collection.payment_sessions.data",
    ],
    filters: { id: cartId },
  })

  const cart = data?.[0] as
    | {
        email?: string | null
        shipping_address?: { phone?: string | null } | null
        payment_collection?: {
          payment_sessions?: PayphoneCartSession[] | null
        } | null
      }
    | undefined

  const sessions = cart?.payment_collection?.payment_sessions || []
  const matches = sessions.filter(
    (session) => session.provider_id === PAYPHONE_PROVIDER_ID
  )
  const session =
    matches.find((item) => item.status === "pending") || matches[0]

  if (!session) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No hay una sesión Payphone en el carrito. Vuelve al paso de pago y elige Payphone."
    )
  }

  return {
    ...session,
    data: (session.data || {}) as Record<string, unknown>,
    email: cart?.email || undefined,
    phone: cart?.shipping_address?.phone || undefined,
  }
}
