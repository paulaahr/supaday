"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Next.js `<Link />` con el country code de la ruta.
 */
const LocalizedClientLink = ({
  children,
  href,
  onClick,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  passHref?: true
  [x: string]: unknown
}) => {
  const { countryCode } = useParams()

  return (
    <Link href={`/${countryCode}${href}`} onClick={onClick} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
