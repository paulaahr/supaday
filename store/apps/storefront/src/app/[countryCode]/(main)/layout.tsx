import { Metadata } from "next"
import { Suspense } from "react"

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import PromoBanner from "@modules/layout/components/promo-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

async function CartChrome() {
  const [customer, cart] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(undefined, "id,customer_id"),
  ])

  if (!customer || !cart) {
    return null
  }

  return <CartMismatchBanner customer={customer} cart={cart} />
}

function NavFallback() {
  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative h-16 border-b border-white/10 bg-usfq-black" />
    </div>
  )
}

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<NavFallback />}>
        <Nav />
      </Suspense>
      <PromoBanner />
      <Suspense fallback={null}>
        <CartChrome />
      </Suspense>
      {props.children}
      <Footer />
    </>
  )
}
