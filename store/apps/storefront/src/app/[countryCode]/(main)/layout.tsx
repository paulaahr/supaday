import { Metadata } from "next"
import { Suspense } from "react"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import PromoBanner from "@modules/layout/components/promo-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

async function CartChrome() {
  const [customer, cart] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
  ])
  let shippingOptions: StoreCartShippingOption[] = []

  // Only fetch shipping when there is something in the cart (demo speed).
  if (cart?.items?.length) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

  return (
    <>
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}
      {cart?.items?.length ? (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      ) : null}
    </>
  )
}

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <PromoBanner />
      <Suspense fallback={null}>
        <CartChrome />
      </Suspense>
      {props.children}
      <Footer />
    </>
  )
}
