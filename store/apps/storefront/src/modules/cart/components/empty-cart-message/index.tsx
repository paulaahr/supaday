import { Heading, Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="rounded-3xl bg-white px-8 py-20 shadow-sm flex flex-col justify-center items-start"
      data-testid="empty-cart-message"
    >
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-usfq-red">
        Tienda campus
      </p>
      <Heading
        level="h1"
        className="font-serif text-4xl text-usfq-black flex flex-row gap-x-2 items-baseline"
      >
        Tu carrito está vacío
      </Heading>
      <Text className="text-base leading-7 text-grey-50 mt-4 mb-8 max-w-[32rem]">
        Aún no agregaste merch oficial. Hay oferta limitada con 50% de
        descuento — aprovecha antes de que termine.
      </Text>
      <InteractiveLink href="/store">Ver colecciones</InteractiveLink>
    </div>
  )
}

export default EmptyCartMessage
