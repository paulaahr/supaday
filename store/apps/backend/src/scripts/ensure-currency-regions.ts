import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

const AMERICAS_COUNTRIES = ["ec", "us"]

export default async function ensureCurrencyRegions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })

  const hasEcuador = regions.some((region) =>
    region.countries?.some((country) => country.iso_2 === "ec")
  )

  if (hasEcuador) {
    logger.info("Americas / Ecuador region already exists. Skipping.")
    return
  }

  const {
    result: [americasRegion],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Americas",
          currency_code: "usd",
          countries: AMERICAS_COUNTRIES,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })

  await createTaxRegionsWorkflow(container).run({
    input: AMERICAS_COUNTRIES.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  })

  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name", "service_zones.id"],
  })

  const fulfillmentSet = fulfillmentSets[0]

  if (fulfillmentSet) {
    const {
      result: [serviceZone],
    } = await createServiceZonesWorkflow(container).run({
      input: {
        data: [
          {
            fulfillment_set_id: fulfillmentSet.id,
            name: "Americas",
            geo_zones: AMERICAS_COUNTRIES.map((country_code) => ({
              type: "country" as const,
              country_code,
            })),
          },
        ],
      },
    })

    const { data: shippingProfiles } = await query.graph({
      entity: "shipping_profile",
      fields: ["id"],
    })

    const serviceZoneId =
      serviceZone?.id || fulfillmentSet.service_zones?.[0]?.id

    if (shippingProfiles[0] && serviceZoneId) {
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Standard Shipping Americas",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: serviceZoneId,
            shipping_profile_id: shippingProfiles[0].id,
            type: {
              label: "Standard",
              description: "Envío en 2-3 días.",
              code: "standard",
            },
            prices: [
              {
                currency_code: "usd",
                amount: 10,
              },
              {
                region_id: americasRegion.id,
                amount: 10,
              },
            ],
            rules: [
              {
                attribute: "enabled_in_store",
                value: "true",
                operator: "eq",
              },
              {
                attribute: "is_return",
                value: "false",
                operator: "eq",
              },
            ],
          },
        ],
      })
    }
  }

  logger.info(
    `Created Americas region ${americasRegion.id} with USD for Ecuador and United States.`
  )
}
