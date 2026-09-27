import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createPriceListsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

const DESCRIPTIONS: Record<string, string> = {
  "peluche cerdito usfq":
    "Peluche suave del cerdito USFQ. Compañero de escritorio, dormitorio y desvelos de parcial.",
  "peluche dragon":
    "El dragón de la USFQ en versión peluche. Ideal para regalar o coleccionar merch del campus.",
  "tote bag de lienzo usfq dragón":
    "Tote de lienzo con el dragón USFQ. Ligera, resistente y perfecta para clase, biblioteca o feria.",
  "tote bag de lienzo usfq dragon":
    "Tote de lienzo con el dragón USFQ. Ligera, resistente y perfecta para clase, biblioteca o feria.",
  "botella térmica acero inoxidable usfq":
    "Botella térmica de acero inoxidable USFQ. Mantiene el café caliente o el agua fría durante todo el día.",
  "botella termica acero inoxidable usfq":
    "Botella térmica de acero inoxidable USFQ. Mantiene el café caliente o el agua fría durante todo el día.",
  "adorno casita de cerámica usfq":
    "Miniatura de cerámica inspirada en el campus. Un detalle para el escritorio, la casa o un regalo.",
  "adorno casita de ceramica usfq":
    "Miniatura de cerámica inspirada en el campus. Un detalle para el escritorio, la casa o un regalo.",
  "maletín deportivo duffle usfq":
    "Duffle deportivo USFQ. Cabe el cambio de ropa, zapatos y lo esencial para gym o un viaje corto.",
  "maletin deportivo duffle usfq":
    "Duffle deportivo USFQ. Cabe el cambio de ropa, zapatos y lo esencial para gym o un viaje corto.",
  "sudadera hoodie roja usfq":
    "Hoodie roja institucional USFQ. Algodón suave, corte unisex y el rojo del campus.",
}

const PRODUCT_PRICES: Record<string, { usd: number; eur: number }> = {
  "peluche cerdito usfq": { usd: 24.9, eur: 22.9 },
  "peluche dragon": { usd: 26.9, eur: 24.9 },
  "tote bag de lienzo usfq dragón": { usd: 18, eur: 16.5 },
  "tote bag de lienzo usfq dragon": { usd: 18, eur: 16.5 },
  "botella térmica acero inoxidable usfq": { usd: 28.5, eur: 26 },
  "botella termica acero inoxidable usfq": { usd: 28.5, eur: 26 },
  "adorno casita de cerámica usfq": { usd: 32, eur: 29 },
  "adorno casita de ceramica usfq": { usd: 32, eur: 29 },
  "maletín deportivo duffle usfq": { usd: 48, eur: 45 },
  "maletin deportivo duffle usfq": { usd: 48, eur: 45 },
  "sudadera hoodie roja usfq": { usd: 54.9, eur: 49.9 },
}

const roundMoney = (value: number) => Math.round(value * 100) / 100

export default async function seedPromoAndDescriptions({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "description", "variants.id"],
  })

  await updateProductsWorkflow(container).run({
    input: {
      products: products.map((product) => {
        const key = (product.title || "").trim().toLowerCase()
        return {
          id: product.id,
          description:
            DESCRIPTIONS[key] ||
            product.description ||
            `Merch oficial USFQ: ${product.title}.`,
        }
      }),
    },
  })

  const { data: existingLists } = await query.graph({
    entity: "price_list",
    fields: ["id", "title"],
  })

  const alreadyCreated = existingLists.some(
    (list) =>
      list.title === "Promo campus 15%" ||
      list.title === "Flash campus · oferta limitada"
  )

  if (alreadyCreated) {
    logger.info(
      "Sale price list already exists. Use seed-temu-flash-sale.ts to refresh flash prices."
    )
    return
  }

  const prices = products.flatMap((product) => {
    const key = (product.title || "").trim().toLowerCase()
    const base = PRODUCT_PRICES[key] || { usd: 20, eur: 18 }

    return (product.variants || []).flatMap((variant) => [
      {
        variant_id: variant.id,
        currency_code: "usd",
        amount: roundMoney(base.usd * 0.85),
      },
      {
        variant_id: variant.id,
        currency_code: "eur",
        amount: roundMoney(base.eur * 0.85),
      },
    ])
  })

  await createPriceListsWorkflow(container).run({
    input: {
      price_lists_data: [
        {
          title: "Promo campus 15%",
          description: "Descuento promocional del 15% en merch USFQ.",
          status: "active",
          type: "sale" as const,
          prices,
        },
      ],
    },
  })

  logger.info(`Created promo price list with ${prices.length} sale prices.`)
}
