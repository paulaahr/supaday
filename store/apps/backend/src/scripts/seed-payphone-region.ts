import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

const PAYPHONE_PROVIDER = "pp_payphone_payphone"
const MANUAL_PROVIDER = "pp_system_default"

export default async function seedPayphoneRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: [
      "id",
      "name",
      "currency_code",
      "countries.iso_2",
      "payment_providers.id",
    ],
  })

  const targetRegions = regions.filter((region) =>
    region.countries?.some(
      (country) => country && ["ec", "us"].includes((country.iso_2 || "").toLowerCase())
    )
  )

  if (!targetRegions.length) {
    logger.warn("No Americas/EC regions found to attach Payphone provider.")
    return
  }

  for (const region of targetRegions) {
    const existing = (region.payment_providers || [])
      .map((p) => p?.id)
      .filter((id): id is string => Boolean(id))
    const providers = Array.from(
      new Set([...existing, MANUAL_PROVIDER, PAYPHONE_PROVIDER])
    )

    if (existing.includes(PAYPHONE_PROVIDER)) {
      logger.info(
        `Region ${region.name} (${region.id}) already has ${PAYPHONE_PROVIDER}.`
      )
      continue
    }

    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: providers,
        },
      },
    })

    logger.info(
      `Attached ${PAYPHONE_PROVIDER} to region ${region.name} (${region.id}).`
    )
  }
}
