"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

/**
 * Solo barra superior — sin overlay bloqueante (el overlay hacía sentir la app rota/lenta).
 */
const NavigationProgress = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<number | null>(null)
  const lockUntil = useRef(0)
  const routeKey = `${pathname}?${searchParams?.toString() || ""}`

  useEffect(() => {
    setActive(false)
    setProgress(100)
    const done = window.setTimeout(() => {
      setProgress(0)
      delete document.body.dataset.navPending
    }, 180)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => window.clearTimeout(done)
  }, [routeKey])

  useEffect(() => {
    const start = () => {
      document.body.dataset.navPending = "1"
      lockUntil.current = Date.now() + 400
      setActive(true)
      setProgress(18)
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      timerRef.current = window.setInterval(() => {
        setProgress((p) => (p >= 90 ? p : p + Math.max(2, (92 - p) * 0.12)))
      }, 120)
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return
      if (anchor.getAttribute("target") === "_blank") return
      if (anchor.hasAttribute("download")) return

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return

      const nextKey = `${url.pathname}?${url.searchParams.toString()}`
      const currentKey = `${window.location.pathname}?${window.location.search.slice(1)}`
      if (nextKey === currentKey) return

      if (
        document.body.dataset.navPending === "1" &&
        Date.now() < lockUntil.current
      ) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      start()
    }

    document.addEventListener("click", onClick, true)
    return () => {
      document.removeEventListener("click", onClick, true)
      if (timerRef.current) window.clearInterval(timerRef.current)
      delete document.body.dataset.navPending
    }
  }, [])

  if (!active && progress === 0) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 bg-transparent"
      aria-hidden={!active}
      role="status"
    >
      <div
        className="h-full bg-usfq-red transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default NavigationProgress
