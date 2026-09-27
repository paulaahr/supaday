import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"

/** Precios de lista (tachados). La oferta flash vive en seed-temu-flash-sale. */
const PRODUCT_PRICES: Record<string, { usd: number; eur: number }> = {
  "peluche cerdito usfq": { usd: 29.9, eur: 27.9 },
  "adorno casita de cerámica usfq": { usd: 36.9, eur: 33.9 },
  "adorno casita de ceramica usfq": { usd: 36.9, eur: 33.9 },
  "maletín deportivo duffle usfq": { usd: 59.9, eur: 54.9 },
  "maletin deportivo duffle usfq": { usd: 59.9, eur: 54.9 },
  "botella térmica acero inoxidable usfq": { usd: 39.9, eur: 36.9 },
  "botella termica acero inoxidable usfq": { usd: 39.9, eur: 36.9 },
  "sudadera hoodie roja usfq": { usd: 69.9, eur: 64.9 },
  "tote bag de lienzo usfq dragón": { usd: 22.9, eur: 20.9 },
  "tote bag de lienzo usfq dragon": { usd: 22.9, eur: 20.9 },
  "peluche dragon": { usd: 34.9, eur: 31.9 },
}

const fallbackPrice = (title: string) => {
  const seed = [...title].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const usd = 24.9 + (seed % 40)
  return { usd, eur: Math.round(usd * 0.92 * 100) / 100 }
}

export default async function seedProductPrices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "variants.id", "variants.title"],
  })

  if (!products.length) {
    logger.info("No products found.")
    return
  }

  const product_variants = products.flatMap((product) => {
    const key = (product.title || "").trim().toLowerCase()
    const price = PRODUCT_PRICES[key] || fallbackPrice(product.title || product.id)

    return (product.variants || []).map((variant) => ({
      id: variant.id,
      prices: [
        { amount: price.usd, currency_code: "usd" },
        { amount: price.eur, currency_code: "eur" },
      ],
    }))
  })

  await updateProductVariantsWorkflow(container).run({
    input: { product_variants },
  })

  for (const product of products) {
    const key = (product.title || "").trim().toLowerCase()
    const price = PRODUCT_PRICES[key] || fallbackPrice(product.title || product.id)
    logger.info(
      `${product.title}: $${price.usd} USD / €${price.eur} EUR (${product.variants?.length || 0} variants)`
    )
  }
}
