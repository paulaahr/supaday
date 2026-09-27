"use server"

import { cache } from "react"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

const CATALOG_TTL_MS = 5 * 60 * 1000

let regionsCache: { at: number; value: HttpTypes.StoreRegion[] } | null = null

async function fetchRegions(): Promise<HttpTypes.StoreRegion[]> {
  if (regionsCache && Date.now() - regionsCache.at < CATALOG_TTL_MS) {
    return regionsCache.value
  }

  const next = {
    ...(await getCacheOptions("regions")),
  }

  const regions = await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)

  regionsCache = { at: Date.now(), value: regions ?? [] }
  return regionsCache.value
}

export const listRegions = cache(fetchRegions)

export const retrieveRegion = cache(async (id: string) => {
  const regions = await listRegions()
  return regions?.find((region) => region.id === id) ?? null
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = cache(async (countryCode: string) => {
  const regions = await listRegions()

  if (!regions) {
    return null
  }

  regionMap.clear()
  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      regionMap.set((c?.iso_2 ?? "").toLowerCase(), region)
    })
  })

  const region = countryCode
    ? regionMap.get(countryCode.toLowerCase())
    : regionMap.get("ec")

  return region
})
