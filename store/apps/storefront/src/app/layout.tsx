import { getBaseURL } from "@lib/util/env"
import { Fraunces, Source_Sans_3 } from "next/font/google"
import { Metadata } from "next"
import { Suspense } from "react"
import NavigationProgress from "@modules/layout/components/navigation-progress"
import "../styles/globals.css"

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "USFQ Store",
    template: "%s | USFQ Store",
  },
  description:
    "Merch oficial del campus USFQ. Colores institucionales y precios en la moneda de tu país.",
  icons: {
    icon: "/usfq/dragon-usfq-negro.svg",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-mode="light"
      className={`${sans.variable} ${serif.variable}`}
    >
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
