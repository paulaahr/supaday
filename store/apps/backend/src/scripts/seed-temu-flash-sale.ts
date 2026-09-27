import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createPriceListsWorkflow,
  deletePriceListsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

const DISCOUNT = 0.5

/** Precio de lista (tachado) → oferta al 50%. */
const LIST_PRICES: Record<string, { listUsd: number; listEur: number }> = {
  "peluche cerdito usfq": { listUsd: 29.9, listEur: 27.9 },
  "peluche dragon": { listUsd: 34.9, listEur: 31.9 },
  "tote bag de lienzo usfq dragón": { listUsd: 22.9, listEur: 20.9 },
  "tote bag de lienzo usfq dragon": { listUsd: 22.9, listEur: 20.9 },
  "botella térmica acero inoxidable usfq": { listUsd: 39.9, listEur: 36.9 },
  "botella termica acero inoxidable usfq": { listUsd: 39.9, listEur: 36.9 },
  "adorno casita de cerámica usfq": { listUsd: 36.9, listEur: 33.9 },
  "adorno casita de ceramica usfq": { listUsd: 36.9, listEur: 33.9 },
  "maletín deportivo duffle usfq": { listUsd: 59.9, listEur: 54.9 },
  "maletin deportivo duffle usfq": { listUsd: 59.9, listEur: 54.9 },
  "sudadera hoodie roja usfq": { listUsd: 69.9, listEur: 64.9 },
}

const FLASH_TITLE = "Flash campus · oferta limitada"
const OLD_PROMO_TITLES = ["Promo campus 15%", FLASH_TITLE]

const roundMoney = (value: number) => Math.round(value * 100) / 100

const resolvePrices = (title: string) => {
  const key = title.trim().toLowerCase()
  const listed = LIST_PRICES[key]
  if (listed) {
    return {
      listUsd: listed.listUsd,
      listEur: listed.listEur,
      saleUsd: roundMoney(listed.listUsd * DISCOUNT),
      saleEur: roundMoney(listed.listEur * DISCOUNT),
    }
  }
  const seed = [...title].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const listUsd = 24.9 + (seed % 40)
  const listEur = roundMoney(listUsd * 0.92)
  return {
    listUsd,
    listEur,
    saleUsd: roundMoney(listUsd * DISCOUNT),
    saleEur: roundMoney(listEur * DISCOUNT),
  }
}

export default async function seedTemuFlashSale({ container }: ExecArgs) {
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
    const price = resolvePrices(product.title || product.id)

    return (product.variants || []).map((variant) => ({
      id: variant.id,
      prices: [
        { amount: price.listUsd, currency_code: "usd" },
        { amount: price.listEur, currency_code: "eur" },
      ],
    }))
  })

  await updateProductVariantsWorkflow(container).run({
    input: { product_variants },
  })
  logger.info(`Updated ${product_variants.length} variants with list prices.`)

  const { data: existingLists } = await query.graph({
    entity: "price_list",
    fields: ["id", "title"],
  })

  const toDelete = existingLists
    .filter((list) => OLD_PROMO_TITLES.includes(list.title || ""))
    .map((list) => list.id)

  if (toDelete.length) {
    await deletePriceListsWorkflow(container).run({
      input: { ids: toDelete },
    })
    logger.info(`Deleted price lists: ${toDelete.join(", ")}`)
  }

  const prices = products.flatMap((product) => {
    const price = resolvePrices(product.title || product.id)

    return (product.variants || []).flatMap((variant) => [
      {
        variant_id: variant.id,
        currency_code: "usd",
        amount: price.saleUsd,
      },
      {
        variant_id: variant.id,
        currency_code: "eur",
        amount: price.saleEur,
      },
    ])
  })

  await createPriceListsWorkflow(container).run({
    input: {
      price_lists_data: [
        {
          title: FLASH_TITLE,
          description: "Oferta limitada: 50% de descuento en merch USFQ.",
          status: "active",
          type: "sale" as const,
          prices,
        },
      ],
    },
  })

  for (const product of products) {
    const price = resolvePrices(product.title || product.id)
    logger.info(
      `${product.title}: $${price.listUsd} → $${price.saleUsd} (-50%)`
    )
  }

  logger.info(`Flash sale (-50%) created with ${prices.length} prices.`)
}
