"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React, { useCallback } from "react"

/**
 * Next.js `<Link />` con country code + anti double-click mientras navega.
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

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (document.body.dataset.navPending === "1") {
        event.preventDefault()
        return
      }
      onClick?.(event)
    },
    [onClick]
  )

  return (
    <Link
      href={`/${countryCode}${href}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}

export default LocalizedClientLink
