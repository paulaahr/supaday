import { placeOrder } from "@lib/data/cart"
import { getAuthHeaders, setCartId } from "@lib/data/cookies"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { unstable_rethrow } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { origin, searchParams } = req.nextUrl

  const cartId = searchParams.get("cart_id")
  const countryCode = searchParams.get("country_code") || "ec"
  const status = searchParams.get("status")
  const paymentId = searchParams.get("id")
  const clientTransactionId = searchParams.get("clientTransactionId")

  const prefix = `/${countryCode}`

  const rejected = (reason = "payment_failed") =>
    NextResponse.redirect(`${origin}${prefix}/cart?error=${reason}`)

  if (!cartId || !paymentId) {
    return rejected()
  }

  await setCartId(cartId)

  if (status === "canceled") {
    return NextResponse.redirect(
      `${origin}${prefix}/checkout?step=payment&error=payphone_canceled`
    )
  }

  if (status !== "approved") {
    return rejected()
  }

  const cart = await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
      method: "GET",
      query: { fields: "payment_collection.payment_sessions.data" },
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    })
    .then(({ cart }) => cart)
    .catch(() => null)

  const paymentSession = cart?.payment_collection?.payment_sessions?.find(
    (session) =>
      session.data?.id === paymentId ||
      session.data?.clientTransactionId === clientTransactionId
  )

  if (!paymentSession) {
    return rejected("payphone_session_missing")
  }

  try {
    await placeOrder(cartId)
  } catch (error) {
    unstable_rethrow(error)
    return NextResponse.redirect(`${origin}${prefix}/cart?error=order_failed`)
  }

  return NextResponse.redirect(`${origin}${prefix}/cart?error=order_failed`)
}
