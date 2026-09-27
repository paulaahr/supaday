import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const itemCount =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-usfq-red">
              Tienda campus
            </p>
            <h1 className="font-serif text-4xl text-usfq-black">Tu carrito</h1>
            <p className="mt-2 text-sm text-grey-50">
              {itemCount} {itemCount === 1 ? "artículo" : "artículos"} · 50% de
              descuento ya aplicado
            </p>
          </div>
        ) : null}

        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-10 gap-y-10">
            <div className="flex flex-col gap-y-6 rounded-3xl bg-white p-6 shadow-sm">
              <ItemsTemplate cart={cart} />
              <LocalizedClientLink
                href="/store"
                className="text-sm text-usfq-red hover:underline"
              >
                Seguir comprando merch
              </LocalizedClientLink>
            </div>
            <div className="relative">
              <div className="sticky top-28 flex flex-col gap-y-4">
                <div className="rounded-3xl bg-usfq-red px-5 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-white">
                  Oferta limitada · 50% hoy
                </div>
                {cart && cart.region && (
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <Summary cart={cart} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
