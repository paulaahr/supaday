import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative h-[72vh] min-h-[480px] w-full overflow-hidden bg-usfq-black text-white">
      <div
        className="ken-burns absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/usfq/hero-campus.jpg')" }}
        role="img"
        aria-label="Campus Universidad San Francisco de Quito"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-usfq-black/55 via-usfq-black/40 to-usfq-black/70" />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center small:px-16">
        <img
          src="/usfq/logo-usfq.svg"
          alt="USFQ"
          width={200}
          height={200}
          className="h-16 w-auto brightness-0 invert small:h-24"
        />
        <div className="animate-cozy">
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-usfq-red">
            Universidad San Francisco de Quito
          </p>
          <h1 className="font-serif text-4xl font-normal leading-tight text-white small:text-6xl">
            Merch oficial del campus
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-serif text-lg leading-relaxed text-white/80 small:text-xl">
            Oferta limitada: 50% de descuento en merch oficial.
          </p>
        </div>
        <LocalizedClientLink
          href="/store"
          className="pressable inline-flex h-11 items-center rounded-full bg-usfq-red px-10 font-medium text-white transition hover:bg-usfq-red-dark"
        >
          Ver colecciones
        </LocalizedClientLink>
      </div>
      <a
        href="#categorias"
        className="scroll-cue absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/70 transition-colors hover:text-white"
      >
        Scroll
      </a>
    </div>
  )
}

export default Hero
