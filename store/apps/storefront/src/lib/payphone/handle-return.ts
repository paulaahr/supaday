import {
  attachPayphoneReturn,
  placeOrder,
  rememberDemoCard,
} from "@lib/data/cart"
import { setCartId } from "@lib/data/cookies"
import { unstable_rethrow } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

export async function handlePayphoneReturn(
  req: NextRequest,
  cartIdFromPath?: string | null
) {
  const { origin, searchParams } = req.nextUrl
  const cartId = cartIdFromPath || searchParams.get("cart_id")
  const countryCode = searchParams.get("country_code") || "ec"
  const status = searchParams.get("status")
  const paymentId = searchParams.get("id")
  const clientTransactionId = searchParams.get("clientTransactionId")
  const last4 = searchParams.get("last4")
  const prefix = `/${countryCode}`

  const rejected = (reason = "payment_failed") =>
    NextResponse.redirect(`${origin}${prefix}/cart?error=${reason}`)

  if (!cartId) {
    return rejected()
  }

  await setCartId(cartId)

  if (status === "canceled") {
    return NextResponse.redirect(
      `${origin}${prefix}/checkout?step=payment&error=payphone_canceled`
    )
  }

  const liveReturn = Boolean(paymentId && /^\d+$/.test(paymentId))

  if (!liveReturn && status !== "approved") {
    return rejected()
  }

  if (!paymentId) {
    return rejected()
  }

  try {
    if (liveReturn) {
      if (!clientTransactionId) {
        return rejected("payphone_session_missing")
      }

      await attachPayphoneReturn({
        cartId,
        payphoneId: paymentId,
        clientTransactionId,
      })
    } else if (
      last4 &&
      clientTransactionId &&
      /^\d{4}$/.test(last4)
    ) {
      await rememberDemoCard({
        cartId,
        last4,
        clientTransactionId,
      })
    }

    await placeOrder(cartId)
  } catch (error) {
    unstable_rethrow(error)
    return NextResponse.redirect(
      `${origin}${prefix}/checkout?step=payment&error=payphone_declined`
    )
  }

  return NextResponse.redirect(`${origin}${prefix}/cart?error=order_failed`)
}
