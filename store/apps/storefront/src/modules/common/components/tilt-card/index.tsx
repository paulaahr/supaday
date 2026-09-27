"use client"

import { clx } from "@modules/common/components/ui"
import { useCallback, useRef, useState } from "react"

type TiltCardProps = {
  children: React.ReactNode
  className?: string
  maxTilt?: number
}

/**
 * Subtle 3D tilt on pointer move — inspired by Bencho "Tilt card".
 * Disabled when the user prefers reduced motion.
 */
const TiltCard = ({ children, className, maxTilt = 7 }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
  })

  const reset = useCallback(() => {
    setStyle({
      transform:
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
      transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
    })
  }, [])

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return
      }
      if (window.matchMedia("(hover: none)").matches) {
        return
      }
      if (document.body.dataset.navPending === "1") {
        return
      }
      const node = ref.current
      if (!node) return

      const rect = node.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      const rotateY = (x - 0.5) * maxTilt * 2
      const rotateX = (0.5 - y) * maxTilt * 2

      setStyle({
        transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`,
        transition: "transform 80ms linear",
      })
    },
    [maxTilt]
  )

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={style}
      className={clx(
        "will-change-transform [transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </div>
  )
}

export default TiltCard
