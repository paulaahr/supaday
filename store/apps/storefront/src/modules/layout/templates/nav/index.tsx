import { Suspense } from "react"
import Image from "next/image"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CountrySelect from "@modules/layout/components/country-select"
import SideMenu from "@modules/layout/components/side-menu"

const MEDUSA_ADMIN_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.replace(/\/$/, "") ||
  "http://localhost:9000"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b border-white/10 bg-usfq-black text-white shadow-sm transition-shadow duration-300">
        <nav className="content-container txt-xsmall-plus flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-80"
              data-testid="nav-store-link"
            >
              <Image
                src="/usfq/dragon-usfq-negro.svg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 brightness-0 invert"
              />
              <span className="font-serif text-xl tracking-wide text-white">
                USFQ Store
              </span>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-3 small:gap-x-4 h-full flex-1 basis-0 justify-end">
            <a
              href={`${MEDUSA_ADMIN_URL}/app`}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable hidden xsmall:inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] uppercase tracking-wide text-white transition-all duration-300 hover:border-usfq-red hover:bg-usfq-red"
              data-testid="nav-admin-link"
            >
              Admin Medusa
            </a>
            {regions && <CountrySelect regions={regions} variant="nav" />}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-usfq-red flex gap-2 transition-colors duration-300"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Carrito (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
