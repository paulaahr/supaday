import { retrieveCart } from "@lib/data/cart"
import CartDropdown from "../cart-dropdown"

/** Light payload for the nav dropdown — avoids the full cart graph on every page. */
const NAV_CART_FIELDS =
  "*items, *items.variant, *items.thumbnail, +items.total, *region"

export default async function CartButton() {
  const cart = await retrieveCart(undefined, NAV_CART_FIELDS).catch(() => null)

  return <CartDropdown cart={cart} />
}
