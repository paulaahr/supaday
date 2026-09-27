import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"

const CATEGORIES = [
  { name: "Ropa", handle: "ropa" },
  { name: "Peluches", handle: "peluches" },
  { name: "Accesorios", handle: "accesorios" },
  { name: "Bebidas", handle: "bebidas" },
  { name: "Decoración", handle: "decoracion" },
]

const CategoryStrip = () => {
  return (
    <section
      id="categorias"
      className="border-b border-usfq-black/10 bg-white/70 py-10"
    >
      <div className="content-container">
        <Reveal>
          <p className="mb-6 text-[10px] uppercase tracking-[0.28em] text-usfq-red">
            Explorar
          </p>
          <nav
            aria-label="Categorías"
            className="flex flex-wrap items-baseline gap-x-8 gap-y-4 small:gap-x-12"
          >
            {CATEGORIES.map((category) => (
              <LocalizedClientLink
                key={category.handle}
                href={`/categories/${category.handle}`}
                className="link-underline font-serif text-2xl text-usfq-black transition-all duration-300 hover:-translate-y-0.5 hover:text-usfq-red small:text-3xl"
              >
                {category.name}
              </LocalizedClientLink>
            ))}
          </nav>
        </Reveal>
      </div>
    </section>
  )
}

export default CategoryStrip
