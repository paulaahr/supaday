import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import CategoryStrip from "@modules/home/components/category-strip"
import CampusSection from "@modules/home/components/campus-section"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import Reveal from "@modules/common/components/reveal"
import { Button, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "USFQ Store",
  description:
    "Merch oficial del campus USFQ. Colores institucionales y precios en la moneda de tu país.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  // Una sola llamada de productos — evita N rails por colección (era muy lento).
  const productsResult = region
    ? await listProducts({
        countryCode,
        queryParams: { limit: 8 },
      })
    : null

  const products = productsResult?.response.products || []

  return (
    <>
      <Hero />
      <CategoryStrip />
      <CampusSection />
      {region && !!products.length && (
        <div id="destacados" className="content-container py-16">
          <Reveal>
            <div className="mb-10 flex items-end justify-between">
              <Text className="font-serif text-3xl">Destacados</Text>
              <LocalizedClientLink href="/store">
                <Button variant="transparent" className="text-usfq-red">
                  Ver todo
                </Button>
              </LocalizedClientLink>
            </div>
          </Reveal>
          <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product, index) => (
              <li key={product.id}>
                <Reveal delay={Math.min(index * 60, 240)}>
                  <ProductPreview
                    product={product}
                    region={region}
                    countryCode={countryCode}
                    isFeatured
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
