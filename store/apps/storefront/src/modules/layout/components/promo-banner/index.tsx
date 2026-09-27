import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FlashCountdown from "@modules/common/components/flash-countdown"

const PromoBanner = () => {
  return (
    <div className="bg-usfq-red text-white">
      <div className="content-container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-center text-xs tracking-[0.14em] uppercase">
        <span className="font-semibold">Oferta relámpago</span>
        <span className="hidden xsmall:inline opacity-70">·</span>
        <span className="opacity-95">50% de descuento · termina en</span>
        <FlashCountdown className="rounded bg-usfq-black/25 px-2 py-0.5 font-mono text-[11px] tracking-wider tabular-nums" />
        <LocalizedClientLink
          href="/store"
          className="underline underline-offset-4 decoration-white/50 hover:decoration-white"
        >
          Comprar ahora
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default PromoBanner
