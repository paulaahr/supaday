import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import TiltCard from "@modules/common/components/tilt-card"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  countryCode?: string
  index?: number
}) {
  const { cheapestPrice } = getProductPrice({
    product,
    countryCode,
  })

  const merchClass =
    (product.metadata?.merch_class as string | undefined) ||
    product.categories?.[0]?.name ||
    null

  const needsSize = Boolean(product.metadata?.needs_size)

  return (
    <TiltCard>
      <LocalizedClientLink href={`/products/${product.handle}`} className="group">
        <div data-testid="product-wrapper">
          <div className="relative">
            {cheapestPrice?.price_type === "sale" && (
              <span className="absolute left-3 top-3 z-10 flex flex-col gap-1">
                <span className="rounded-full bg-usfq-red px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  -{cheapestPrice.percentage_diff}%
                </span>
                <span className="rounded-full bg-usfq-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Oferta limitada
                </span>
              </span>
            )}
            {merchClass && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-usfq-black/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {merchClass}
              </span>
            )}
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex txt-compact-medium justify-between gap-4">
              <Text
                className="text-usfq-black transition-colors duration-300 group-hover:text-usfq-red"
                data-testid="product-title"
              >
                {product.title}
              </Text>
              <div className="flex items-center gap-x-2">
                {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
              </div>
            </div>
            {needsSize && (
              <Text className="text-[11px] uppercase tracking-wide text-grey-50">
                Disponible en tallas
              </Text>
            )}
            {product.description && (
              <Text className="text-sm leading-6 text-grey-50 line-clamp-2">
                {product.description}
              </Text>
            )}
          </div>
        </div>
      </LocalizedClientLink>
    </TiltCard>
  )
}
