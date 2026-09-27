"use client"

import { useEffect, useState } from "react"

/** Cuenta regresiva hasta medianoche America/Guayaquil (oferta “del día”). */
function msUntilQuitoMidnight(now = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(now))

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value || 0)

  const y = get("year")
  const m = get("month")
  const d = get("day")
  const h = get("hour")
  const min = get("minute")
  const s = get("second")

  const secondsToday = h * 3600 + min * 60 + s
  const secondsLeft = 24 * 3600 - secondsToday
  return secondsLeft * 1000
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
}

const FlashCountdown = ({ className }: { className?: string }) => {
  const [label, setLabel] = useState("--:--:--")

  useEffect(() => {
    const tick = () => setLabel(formatCountdown(msUntilQuitoMidnight()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span
      className={className}
      suppressHydrationWarning
      data-testid="flash-countdown"
    >
      {label}
    </span>
  )
}

export default FlashCountdown
