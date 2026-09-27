import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CampusSection = () => {
  return (
    <section className="relative min-h-[48vh] w-full overflow-hidden bg-usfq-black text-white">
      <div
        className="ken-burns absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/usfq/campus-atmosphere.jpg')" }}
        role="img"
        aria-label="Ambiente del campus USFQ"
      />
      <div className="absolute inset-0 bg-usfq-black/55" />
      <div className="relative z-10 content-container flex min-h-[48vh] flex-col items-start justify-end py-14 small:py-20">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-usfq-red">
          Cumbayá · Quito
        </p>
        <h2 className="max-w-xl font-serif text-3xl leading-tight small:text-5xl">
          Hecho para la vida en el campus
        </h2>
        <p className="mt-4 max-w-md text-base leading-7 text-white/75">
          Peluches, ropa, botellas y accesorios con la identidad USFQ.
        </p>
        <LocalizedClientLink
          href="/store"
          className="pressable mt-8 inline-flex h-11 items-center rounded-full border border-white/30 px-8 text-white transition hover:border-usfq-red hover:bg-white/5"
        >
          Ver colecciones
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default CampusSection
