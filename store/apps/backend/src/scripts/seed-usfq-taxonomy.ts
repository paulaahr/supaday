import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  batchProductVariantsWorkflow,
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  setProductProductOptionsWorkflow,
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

type ProductClass = {
  merch_class: string
  category_name: string
  collection_handle: string
  material: string
  needs_size: boolean
  description: string
}

const PRODUCT_CLASS: Record<string, ProductClass> = {
  "peluche cerdito usfq": {
    merch_class: "Peluches",
    category_name: "Peluches",
    collection_handle: "peluches-usfq",
    material: "Felpa suave",
    needs_size: false,
    description:
      "Peluche suave del cerdito USFQ. Compañero de escritorio, dormitorio y desvelos de parcial.",
  },
  "peluche dragon": {
    merch_class: "Peluches",
    category_name: "Peluches",
    collection_handle: "peluches-usfq",
    material: "Felpa suave",
    needs_size: false,
    description:
      "El dragón de la USFQ en versión peluche. Ideal para regalar o coleccionar merch del campus.",
  },
  "tote bag de lienzo usfq dragón": {
    merch_class: "Accesorios",
    category_name: "Accesorios",
    collection_handle: "campus-essentials",
    material: "Lienzo de algodón",
    needs_size: false,
    description:
      "Tote de lienzo con el dragón USFQ. Ligera, resistente y perfecta para clase, biblioteca o feria.",
  },
  "tote bag de lienzo usfq dragon": {
    merch_class: "Accesorios",
    category_name: "Accesorios",
    collection_handle: "campus-essentials",
    material: "Lienzo de algodón",
    needs_size: false,
    description:
      "Tote de lienzo con el dragón USFQ. Ligera, resistente y perfecta para clase, biblioteca o feria.",
  },
  "botella térmica acero inoxidable usfq": {
    merch_class: "Bebidas",
    category_name: "Bebidas",
    collection_handle: "campus-essentials",
    material: "Acero inoxidable",
    needs_size: false,
    description:
      "Botella térmica de acero inoxidable USFQ. Mantiene el café caliente o el agua fría durante todo el día.",
  },
  "botella termica acero inoxidable usfq": {
    merch_class: "Bebidas",
    category_name: "Bebidas",
    collection_handle: "campus-essentials",
    material: "Acero inoxidable",
    needs_size: false,
    description:
      "Botella térmica de acero inoxidable USFQ. Mantiene el café caliente o el agua fría durante todo el día.",
  },
  "adorno casita de cerámica usfq": {
    merch_class: "Decoración",
    category_name: "Decoración",
    collection_handle: "campus-essentials",
    material: "Cerámica",
    needs_size: false,
    description:
      "Miniatura de cerámica inspirada en el campus. Un detalle para el escritorio, la casa o un regalo.",
  },
  "adorno casita de ceramica usfq": {
    merch_class: "Decoración",
    category_name: "Decoración",
    collection_handle: "campus-essentials",
    material: "Cerámica",
    needs_size: false,
    description:
      "Miniatura de cerámica inspirada en el campus. Un detalle para el escritorio, la casa o un regalo.",
  },
  "maletín deportivo duffle usfq": {
    merch_class: "Accesorios",
    category_name: "Accesorios",
    collection_handle: "campus-essentials",
    material: "Poliéster resistente",
    needs_size: false,
    description:
      "Duffle deportivo USFQ. Cabe el cambio de ropa, zapatos y lo esencial para gym o un viaje corto.",
  },
  "maletin deportivo duffle usfq": {
    merch_class: "Accesorios",
    category_name: "Accesorios",
    collection_handle: "campus-essentials",
    material: "Poliéster resistente",
    needs_size: false,
    description:
      "Duffle deportivo USFQ. Cabe el cambio de ropa, zapatos y lo esencial para gym o un viaje corto.",
  },
  "sudadera hoodie roja usfq": {
    merch_class: "Ropa",
    category_name: "Ropa",
    collection_handle: "ropa-usfq",
    material: "Algodón / poliéster",
    needs_size: true,
    description:
      "Hoodie roja institucional USFQ. Algodón suave, corte unisex y el rojo del campus. Elige tu talla.",
  },
}

const HOODIE_SIZES = ["S", "M", "L", "XL"] as const
const HOODIE_PRICES = { usd: 54.9, eur: 49.9 }

const CATEGORY_DEFS = [
  { name: "Peluches", handle: "peluches" },
  { name: "Ropa", handle: "ropa" },
  { name: "Accesorios", handle: "accesorios" },
  { name: "Bebidas", handle: "bebidas" },
  { name: "Decoración", handle: "decoracion" },
]

const COLLECTION_DEFS = [
  {
    title: "Peluches USFQ",
    handle: "peluches-usfq",
  },
  {
    title: "Campus essentials",
    handle: "campus-essentials",
  },
  {
    title: "Ropa USFQ",
    handle: "ropa-usfq",
  },
]

export default async function seedUsfqTaxonomy({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  })

  const categoryByName = new Map(
    existingCategories.map((c) => [c.name.toLowerCase(), c])
  )

  const missingCategories = CATEGORY_DEFS.filter(
    (c) => !categoryByName.has(c.name.toLowerCase())
  )

  if (missingCategories.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategories.map((c) => ({
          name: c.name,
          handle: c.handle,
          is_active: true,
        })),
      },
    })
    for (const cat of result) {
      categoryByName.set(cat.name.toLowerCase(), cat)
    }
    logger.info(`Created categories: ${missingCategories.map((c) => c.name).join(", ")}`)
  }

  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "title", "handle"],
  })

  const collectionByHandle = new Map(
    existingCollections.map((c) => [c.handle, c])
  )

  const missingCollections = COLLECTION_DEFS.filter(
    (c) => !collectionByHandle.has(c.handle)
  )

  if (missingCollections.length) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: missingCollections.map((c) => ({
          title: c.title,
          handle: c.handle,
        })),
      },
    })
    for (const col of result) {
      collectionByHandle.set(col.handle, col)
    }
    logger.info(
      `Created collections: ${missingCollections.map((c) => c.title).join(", ")}`
    )
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "metadata",
      "options.id",
      "options.title",
      "options.values.id",
      "options.values.value",
      "variants.id",
      "variants.title",
    ],
  })

  const productUpdates = []

  for (const product of products) {
    const key = (product.title || "").trim().toLowerCase()
    const cls = PRODUCT_CLASS[key]
    if (!cls) {
      continue
    }

    const category = categoryByName.get(cls.category_name.toLowerCase())
    const collection = collectionByHandle.get(cls.collection_handle)

    productUpdates.push({
      id: product.id,
      description: cls.description,
      material: cls.material,
      collection_id: collection?.id || undefined,
      categories: category ? [{ id: category.id }] : [],
      metadata: {
        ...(product.metadata || {}),
        merch_class: cls.merch_class,
        needs_size: cls.needs_size,
      },
    })
  }

  if (productUpdates.length) {
    await updateProductsWorkflow(container).run({
      input: { products: productUpdates },
    })
    logger.info(`Updated taxonomy on ${productUpdates.length} products.`)
  }

  // Rename default variants on non-apparel so cart doesn't show "Default variant"
  const simpleVariantUpdates = products
    .filter((product) => {
      const key = (product.title || "").trim().toLowerCase()
      const cls = PRODUCT_CLASS[key]
      return cls && !cls.needs_size
    })
    .flatMap((product) =>
      (product.variants || []).map((variant) => ({
        id: variant.id,
        title: "Único",
      }))
    )

  if (simpleVariantUpdates.length) {
    await updateProductVariantsWorkflow(container).run({
      input: { product_variants: simpleVariantUpdates },
    })
    logger.info(`Renamed ${simpleVariantUpdates.length} one-size variants to Único.`)
  }

  // Hoodie: ensure Talla option + S/M/L/XL variants
  const hoodie = products.find(
    (p) => (p.title || "").trim().toLowerCase() === "sudadera hoodie roja usfq"
  )

  if (!hoodie) {
    logger.warn("Hoodie product not found; skipping size variants.")
    return
  }

  // Refresh hoodie after taxonomy update
  const { data: hoodieFresh } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "variants.id",
      "variants.title",
      "variants.options.value",
      "options.id",
      "options.title",
      "options.values.id",
      "options.values.value",
    ],
    filters: { id: hoodie.id },
  })

  const hoodieProduct = hoodieFresh[0]
  if (!hoodieProduct) {
    logger.warn("Could not reload hoodie product.")
    return
  }

  const sizeVariantTitles = new Set(
    (hoodieProduct.variants || [])
      .map((v) => (v.title || "").toUpperCase())
      .filter((t) => HOODIE_SIZES.includes(t as (typeof HOODIE_SIZES)[number]))
  )

  if (sizeVariantTitles.size === HOODIE_SIZES.length) {
    logger.info("Hoodie already has size variants.")
    return
  }

  const defaultVariants = (hoodieProduct.variants || []).filter((v) => {
    const title = (v.title || "").toUpperCase()
    return !HOODIE_SIZES.includes(title as (typeof HOODIE_SIZES)[number])
  })

  // Remove placeholder variants so option values can be replaced.
  if (defaultVariants.length) {
    await batchProductVariantsWorkflow(container).run({
      input: {
        delete: defaultVariants.map((v) => v.id),
      },
    })
    logger.info(`Removed ${defaultVariants.length} placeholder hoodie variant(s).`)
  }

  const hasTallaLinked = (hoodieProduct.options || []).some(
    (o) => (o.title || "").toLowerCase() === "talla"
  )

  // Ensure a Talla option exists (may already be created but not linked).
  let { data: tallaOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title", "values.id", "values.value"],
    filters: { title: "Talla" },
  })

  if (!tallaOptions.length) {
    const { result } = await createProductOptionsWorkflow(container).run({
      input: {
        product_options: [
          {
            title: "Talla",
            values: [...HOODIE_SIZES],
            is_exclusive: true,
          },
        ],
      },
    })
    tallaOptions = result
    logger.info("Created Talla product option.")
  }

  const tallaOption = tallaOptions[0]
  const defaultOptions = (hoodieProduct.options || []).filter(
    (o) => (o.title || "").toLowerCase() !== "talla"
  )

  await setProductProductOptionsWorkflow(container).run({
    input: {
      product_id: hoodie.id,
      add: hasTallaLinked
        ? undefined
        : [
            {
              product_option_id: tallaOption.id,
              product_option_value_ids: (tallaOption.values || []).map(
                (v) => v.id
              ),
            },
          ],
      remove: defaultOptions.map((o) => o.id),
    },
  })
  logger.info(
    `Linked Talla to hoodie and removed ${defaultOptions.length} legacy option(s).`
  )

  const sizesToCreate = HOODIE_SIZES.filter((size) => !sizeVariantTitles.has(size))

  if (sizesToCreate.length) {
    await batchProductVariantsWorkflow(container).run({
      input: {
        create: sizesToCreate.map((size) => ({
          product_id: hoodie.id,
          title: size,
          options: { Talla: size },
          manage_inventory: false,
          allow_backorder: true,
          prices: [
            { amount: HOODIE_PRICES.usd, currency_code: "usd" },
            { amount: HOODIE_PRICES.eur, currency_code: "eur" },
          ],
        })),
      },
    })
    logger.info(`Hoodie sizes created: ${sizesToCreate.join(", ")}.`)
  }
}
