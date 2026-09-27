"use server"

import { cache } from "react"
import { sdk } from "@lib/config"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

const CATALOG_TTL_MS = 5 * 60 * 1000

const LIST_FIELDS =
  "id,title,handle,description,thumbnail,metadata,created_at,*variants.calculated_price"

const DETAIL_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,+description,+title,+handle,+thumbnail,*images,*collection,*categories"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

type ProductListResult = {
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}

const productMemory = new Map<string, { at: number; value: ProductListResult }>()

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))

    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(",")}}`
  }

  return JSON.stringify(value) ?? "null"
}

function fieldsFor(queryParams?: ProductListQueryParams) {
  if (queryParams?.fields) {
    return queryParams.fields
  }

  if (queryParams?.handle || queryParams?.id) {
    return DETAIL_FIELDS
  }

  return LIST_FIELDS
}

function cloneResult(result: ProductListResult): ProductListResult {
  return {
    ...result,
    response: {
      ...result.response,
      products: result.response.products.slice(),
    },
  }
}

const loadProducts = cache(
  async (
    cacheKey: string,
    requestJson: string,
    persist: string
  ): Promise<ProductListResult> => {
    if (persist === "1") {
      const hit = productMemory.get(cacheKey)
      if (hit && Date.now() - hit.at < CATALOG_TTL_MS) {
        return cloneResult(hit.value)
      }
    }

    const request = JSON.parse(requestJson) as {
      limit: number
      offset: number
      regionId: string
      fields: string
      query: Record<string, unknown>
      pageParam: number
      queryParams?: ProductListQueryParams
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("products")),
    }

    const result = await sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
        `/store/products`,
        {
          method: "GET",
          query: {
            limit: request.limit,
            offset: request.offset,
            region_id: request.regionId,
            fields: request.fields,
            ...request.query,
          },
          headers,
          next,
          cache: "force-cache",
        }
      )
      .then(({ products, count }) => {
        const nextPage =
          count > request.offset + request.limit ? request.pageParam + 1 : null

        return {
          response: {
            products,
            count,
          },
          nextPage,
          queryParams: request.queryParams,
        }
      })

    if (persist === "1") {
      productMemory.set(cacheKey, { at: Date.now(), value: result })
      if (productMemory.size > 40) {
        const oldest = productMemory.keys().next().value
        if (oldest) {
          productMemory.delete(oldest)
        }
      }
    }

    return result
  }
)

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<ProductListResult> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const { fields: _fields, ...restQuery } = queryParams ?? {}
  const fields = fieldsFor(queryParams)
  const headers = await getAuthHeaders()
  const persist = "authorization" in headers ? "0" : "1"

  const request = {
    limit,
    offset,
    regionId: region.id,
    fields,
    query: restQuery,
    pageParam,
    queryParams,
  }

  const cacheKey = stableStringify({
    limit,
    offset,
    regionId: region.id,
    fields,
    query: restQuery,
    pageParam,
  })

  return loadProducts(cacheKey, JSON.stringify(request), persist)
}

/**
 * Fetches a capped catalog page, sorts it, and returns the requested slice.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
}): Promise<ProductListResult> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  // Cap batch size for local demos (catalog is small). Was 100 and felt sluggish.
  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
      limit: 24,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products.slice(), sortBy)

  const pageParam = (page - 1) * limit

  const filteredCount = products.length

  const nextPage = filteredCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}
