import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"

export default async function fixHoodieInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "variants.id", "variants.title"],
    filters: { handle: "sudadera-hoodie-roja-usfq" },
  })

  const variants = data[0]?.variants || []
  if (!variants.length) {
    logger.warn("No hoodie variants found.")
    return
  }

  await updateProductVariantsWorkflow(container).run({
    input: {
      product_variants: variants.map((v) => ({
        id: v.id,
        manage_inventory: false,
        allow_backorder: true,
      })),
    },
  })

  logger.info(`Updated inventory flags on ${variants.length} hoodie variants.`)
}
