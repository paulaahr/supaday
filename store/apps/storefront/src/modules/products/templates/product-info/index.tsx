import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-usfq-red hover:text-usfq-red-dark"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        {!product.collection && product.categories?.[0] && (
          <LocalizedClientLink
            href={`/categories/${product.categories[0].handle}`}
            className="text-medium text-usfq-red hover:text-usfq-red-dark"
          >
            {product.categories[0].name}
          </LocalizedClientLink>
        )}
        {(product.metadata?.merch_class as string | undefined) && (
          <p className="text-xs uppercase tracking-[0.25em] text-usfq-red">
            {String(product.metadata.merch_class)}
          </p>
        )}
        <Heading
          level="h1"
          className="font-serif text-4xl leading-tight text-usfq-black"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-base leading-7 text-grey-60 whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description ||
            "Merch oficial USFQ. Revisa los detalles y agrégalo al carrito."}
        </Text>
        {product.metadata?.needs_size ? (
          <Text className="text-sm text-grey-50">
            Este producto requiere elegir talla (S–XL).
          </Text>
        ) : (
          <Text className="text-sm text-grey-50">
            Talla única — no necesita selector de medidas.
          </Text>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
