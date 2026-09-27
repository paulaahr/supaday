"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Información del producto",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Envíos y cambios",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const merchClass =
    (product.metadata?.merch_class as string | undefined) ||
    product.categories?.[0]?.name ||
    null

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <span className="font-semibold">Clasificación</span>
          <p>{merchClass || "Merch USFQ"}</p>
        </div>
        <div>
          <span className="font-semibold">Material</span>
          <p>{product.material ? product.material : "—"}</p>
        </div>
        <div>
          <span className="font-semibold">Colección</span>
          <p>{product.collection?.title || "—"}</p>
        </div>
        <div>
          <span className="font-semibold">Tallas</span>
          <p>
            {product.metadata?.needs_size
              ? "Sí — elige S, M, L o XL"
              : "Talla única / no aplica"}
          </p>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Envío Ecuador</span>
            <p className="max-w-sm">
              Entrega estimada en 3–5 días hábiles a domicilio o retiro en
              campus (según disponibilidad).
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Cambios de talla</span>
            <p className="max-w-sm">
              En ropa (hoodie) puedes solicitar cambio de talla si el producto
              está sin uso y con etiquetas.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Devoluciones</span>
            <p className="max-w-sm">
              Tienes 14 días para devolver merch no personalizado. El peluche y
              la botella deben llegar en su empaque original.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
