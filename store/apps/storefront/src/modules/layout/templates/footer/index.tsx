import Image from "next/image"
import { Text, clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FOOTER_CATEGORIES = [
  { name: "Ropa", handle: "ropa" },
  { name: "Peluches", handle: "peluches" },
  { name: "Accesorios", handle: "accesorios" },
  { name: "Bebidas", handle: "bebidas" },
  { name: "Decoración", handle: "decoracion" },
]

const FOOTER_COLLECTIONS = [
  { title: "Peluches USFQ", handle: "peluches-usfq" },
  { title: "Campus essentials", handle: "campus-essentials" },
  { title: "Ropa USFQ", handle: "ropa-usfq" },
]

/** Footer estático — sin fetch al backend en cada navegación. */
export default function Footer() {
  return (
    <footer className="border-t border-white/10 w-full bg-usfq-black text-white">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-16">
          <div>
            <LocalizedClientLink
              href="/"
              className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-80"
            >
              <Image
                src="/usfq/logo-usfq.svg"
                alt="USFQ"
                width={72}
                height={72}
                className="h-12 w-auto brightness-0 invert"
              />
              <span className="font-serif text-2xl text-white">USFQ Store</span>
            </LocalizedClientLink>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Merch oficial del campus. Demo en clase — checkout como invitado.
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-white">Categorías</span>
              <ul className="grid grid-cols-1 gap-2 text-white/60 txt-small">
                {FOOTER_CATEGORIES.map((c) => (
                  <li key={c.handle}>
                    <LocalizedClientLink
                      className="hover:text-usfq-red transition-colors duration-300"
                      href={`/categories/${c.handle}`}
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-white">Colecciones</span>
              <ul className="grid grid-cols-1 gap-2 text-white/60 txt-small">
                {FOOTER_COLLECTIONS.map((c) => (
                  <li key={c.handle}>
                    <LocalizedClientLink
                      className="hover:text-usfq-red transition-colors duration-300"
                      href={`/collections/${c.handle}`}
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-white">Ayuda</span>
              <ul className="grid grid-cols-1 gap-y-2 text-white/60 txt-small">
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-usfq-red transition-colors duration-300"
                  >
                    Tienda
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/cart"
                    className="hover:text-usfq-red transition-colors duration-300"
                  >
                    Carrito y envíos
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-12 justify-between text-white/50">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} USFQ Store. Todos los derechos
            reservados.
          </Text>
          <Text className={clx("txt-compact-small")}>USFQ Store · Quito</Text>
        </div>
      </div>
    </footer>
  )
}
