"use client"

import { clx } from "@modules/common/components/ui"
import { useCallback, useRef, useState } from "react"

type MagneticProps = {
  children: React.ReactNode
  className?: string
  strength?: number
  style?: React.CSSProperties
}

/**
 * Soft magnetic pull toward the cursor — inspired by Bencho magnetic/hover blocks.
 */
const Magnetic = ({ children, className, strength = 0.28, style }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return
      }
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      setOffset({ x: x * strength, y: y * strength })
    },
    [strength]
  )

  const onLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        ...style,
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={clx("inline-flex will-change-transform", className)}
    >
      {children}
    </div>
  )
}

export default Magnetic
